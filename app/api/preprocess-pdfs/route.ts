import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getServerSupabaseClient } from '@/lib/supabase'
import { processChunksWithEmbeddings } from '@/lib/embeddings'

// 서버리스 환경에서 안전한 PDF 파싱
async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // 동적 import로 서버리스 환경에서 안전하게 로드
    const pdfParse = await import('pdf-parse')
    const result = await pdfParse.default(buffer)
    return result.text
  } catch (error) {
    console.error('PDF 파싱 오류:', error)
    throw new Error('PDF 파일을 읽을 수 없습니다.')
  }
}

export const runtime = 'nodejs'
export const maxDuration = 300 // 5분으로 증가 (여러 PDF 처리 시간 고려)
export const dynamic = 'force-dynamic'

// 간단한 텍스트 스플리터 구현
function splitText(text: string, chunkSize: number = 1000, chunkOverlap: number = 200): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)
    
    // 문장 경계에서 자르기 시도
    if (end < text.length) {
      const lastSentenceEnd = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const lastBreak = Math.max(lastSentenceEnd, lastNewline)
      
      if (lastBreak > start + chunkSize * 0.5) {
        chunk = chunk.slice(0, lastBreak + 1)
      }
    }
    
    chunks.push(chunk.trim())
    start += chunk.length - chunkOverlap
    
    if (start >= text.length) break
    if (chunk.length <= chunkOverlap) start += chunkSize
  }
  
  return chunks.filter(chunk => chunk.length > 0)
}

export async function POST(request: NextRequest) {
  try {
    console.log('기본 PDF 전처리 시작')
    
    // 환경 확인
    const isProduction = process.env.NODE_ENV === 'production'
    const isVercel = process.env.VERCEL === '1'
    
    console.log('환경 정보:', { isProduction, isVercel })
    
    // pdf 폴더 경로 확인 (환경별로 다른 경로 시도)
    let pdfFolderPath = ''
    const possiblePaths = [
      join(process.cwd(), 'public', 'pdf'),
      join(process.cwd(), 'pdf'),
      join(process.cwd(), '..', 'pdf') // Vercel 빌드 시 상위 폴더
    ]
    
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        const files = await readdir(path)
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))
        if (pdfFiles.length > 0) {
          pdfFolderPath = path
          break
        }
      }
    }
    
    if (!pdfFolderPath) {
      console.log('PDF 폴더를 찾을 수 없습니다. 가능한 경로들:', possiblePaths)
      
      // 프로덕션 환경에서는 기본 문서가 이미 데이터베이스에 있다고 가정
      if (isProduction) {
        return NextResponse.json({
          success: true,
          message: '프로덕션 환경에서는 기본 문서들이 이미 준비되어 있습니다.',
          totalFiles: 0,
          results: [],
          summary: { success: 0, failed: 0, skipped: 0 }
        })
      }
      
      return NextResponse.json(
        { error: 'pdf 폴더를 찾을 수 없습니다. 로컬 환경에서는 pdf/ 폴더에 파일을 넣어주세요.' },
        { status: 404 }
      )
    }

    // PDF 파일 목록 가져오기
    const files = await readdir(pdfFolderPath)
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))

    console.log(`발견된 PDF 파일: ${pdfFiles.length}개`, pdfFiles)

    // Supabase 클라이언트 초기화
    const supabase = getServerSupabaseClient()
    
    // 기존 기본 문서들 정리 (선택사항)
    const isForceRefresh = request.nextUrl.searchParams.get('force') === 'true'
    
    if (isForceRefresh) {
      console.log('기존 기본 문서들 정리 중...')
      // 기본 문서들 삭제 (filename이 'pdf/' 접두사를 가진 것들)
      await supabase
        .from('document_chunks')
        .delete()
        .like('metadata->>source', 'pdf/%')
      
      const { data: defaultDocs } = await supabase
        .from('documents')
        .select('id')
        .like('filename', 'pdf/%')
      
      if (defaultDocs && defaultDocs.length > 0) {
        const docIds = defaultDocs.map(doc => doc.id)
        await supabase
          .from('documents')
          .delete()
          .in('id', docIds)
      }
    }

    const results = []

    // 각 PDF 파일 처리
    for (const filename of pdfFiles) {
      try {
        console.log(`처리 중: ${filename}`)
        
        const filePath = join(pdfFolderPath, filename)
        const fileBuffer = await readFile(filePath)
        
        // PDF 파싱
        const text = await parsePdf(fileBuffer)

        if (!text || text.trim().length === 0) {
          console.warn(`${filename}: 텍스트를 추출할 수 없습니다.`)
          results.push({ filename, status: 'failed', reason: '텍스트 추출 불가' })
          continue
        }

        // 텍스트 청킹
        const chunks = splitText(text, 1000, 200)
        console.log(`${filename}: ${chunks.length}개 청크 생성`)

        // 기존에 같은 파일이 처리되었는지 확인
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('filename', `pdf/${filename}`)
          .single()

        if (existingDoc && !isForceRefresh) {
          console.log(`${filename}: 이미 처리된 파일입니다. 건너뜀`)
          results.push({ filename, status: 'skipped', reason: '이미 처리됨' })
          continue
        }

        // 문서 정보 저장
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .upsert({
            filename: `pdf/${filename}`,
            file_size: fileBuffer.length,
            text_content: text.substring(0, 10000), // 처음 10000자만 저장
            chunk_count: chunks.length,
            upload_time: new Date().toISOString(),
          }, {
            onConflict: 'filename'
          })
          .select()
          .single()

        if (docError) {
          console.error(`${filename} 문서 저장 오류:`, docError)
          results.push({ filename, status: 'failed', reason: `문서 저장 실패: ${docError.message}` })
          continue
        }

        console.log(`${filename} 문서 저장 완료:`, docData.id)

        // 기존 청크들 삭제 (업데이트인 경우)
        if (existingDoc || isForceRefresh) {
          await supabase
            .from('document_chunks')
            .delete()
            .eq('document_id', docData.id)
        }

        // 청크들 벡터 임베딩과 함께 저장
        const chunksWithMetadata = chunks.map((chunk, index) => ({
          text: chunk,
          metadata: {
            source: `pdf/${filename}`,
            chunkIndex: index,
            uploadTime: new Date().toISOString(),
            isDefault: true
          },
          chunkIndex: index
        }))

        // 벡터 임베딩 생성 및 저장
        await processChunksWithEmbeddings(chunksWithMetadata, docData.id)

        console.log(`${filename}: ${chunks.length}개 청크 벡터 임베딩 저장 완료`)
        results.push({ 
          filename, 
          status: 'success', 
          chunks: chunks.length,
          textLength: text.length 
        })

      } catch (error) {
        console.error(`${filename} 처리 오류:`, error)
        results.push({ 
          filename, 
          status: 'failed', 
          reason: error instanceof Error ? error.message : '알 수 없는 오류' 
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length
    const skippedCount = results.filter(r => r.status === 'skipped').length

    return NextResponse.json({
      success: true,
      message: `PDF 전처리 완료: 성공 ${successCount}개, 실패 ${failedCount}개, 건너뜀 ${skippedCount}개`,
      totalFiles: pdfFiles.length,
      results: results,
      summary: {
        success: successCount,
        failed: failedCount,
        skipped: skippedCount
      }
    })

  } catch (error) {
    console.error('PDF 전처리 전체 오류:', error)
    return NextResponse.json(
      { error: `PDF 전처리에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}

// 전처리 상태 확인을 위한 GET 엔드포인트
export async function GET() {
  try {
    const supabase = getServerSupabaseClient()
    
    // 기본 문서들 조회
    const { data: docs, error } = await supabase
      .from('documents')
      .select('id, filename, file_size, chunk_count, upload_time')
      .like('filename', 'pdf/%')
      .order('upload_time', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `문서 조회 실패: ${error.message}` },
        { status: 500 }
      )
    }

    // 전체 청크 수 계산
    const { data: chunksData } = await supabase
      .from('document_chunks')
      .select('document_id')
      .in('document_id', docs?.map(doc => doc.id) || [])

    const totalChunks = chunksData?.length || 0

    return NextResponse.json({
      success: true,
      documents: docs || [],
      totalDocuments: docs?.length || 0,
      totalChunks: totalChunks
    })

  } catch (error) {
    console.error('PDF 상태 조회 오류:', error)
    return NextResponse.json(
      { error: `상태 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}
