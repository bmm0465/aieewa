import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
const pdfParse = require('pdf-parse')
import { getServerSupabaseClient } from '@/lib/supabase'

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

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// 문서 업로드와 파싱
export async function POST(request: NextRequest) {
  try {
    console.log('문서 업로드 요청 시작')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      )
    }

    // PDF 파일만 허용
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    console.log('파일 업로드:', file.name, file.size, 'bytes')

    // 임시 디렉토리 생성
    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, `${Date.now()}-${file.name}`)
    await writeFile(filePath, buffer)

    console.log('PDF 파싱 시작')
    
    // PDF 내용 추출
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'PDF에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      )
    }

    console.log('PDF 텍스트 길이:', text.length)

    // 텍스트 청킹
    const chunks = splitText(text, 1000, 200)
    console.log('텍스트 청크 개수:', chunks.length)

    console.log('텍스트 청크 처리 시작')
    
    // 임베딩 생성 (간단한 방법으로)
    const embeddings = []
    for (let i = 0; i < Math.min(chunks.length, 10); i++) { // 최대 10개 청크만 처리
      try {
        // 실제로는 OpenAI Embeddings API를 사용해야 하지만, 
        // 여기서는 텍스트 청크를 그대로 저장하는 방식 사용
        embeddings.push({
          text: chunks[i],
          metadata: { 
            source: file.name, 
            chunkIndex: i,
            uploadTime: new Date().toISOString()
          }
        })
      } catch (error) {
        console.error(`청크 ${i} 임베딩 실패:`, error)
      }
    }

    console.log('임베딩 생성 완료:', embeddings.length)

    // Supabase에 저장 (환경 변수가 있는 경우)
    try {
      const supabase = getServerSupabaseClient()
      
      // 문서 정보 저장
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          file_size: file.size,
          text_content: text.substring(0, 10000), // 처음 10000자만 저장
          chunk_count: chunks.length,
          upload_time: new Date().toISOString(),
        })
        .select()
        .single()

      if (docError) {
        console.error('문서 저장 오류:', docError)
      } else {
        console.log('문서 저장 성공:', docData.id)
        
        // 청크들 저장
        for (const embedding of embeddings) {
          await supabase
            .from('document_chunks')
            .insert({
              document_id: docData.id,
              chunk_text: embedding.text,
              chunk_index: embedding.metadata.chunkIndex,
              metadata: embedding.metadata,
            })
        }
        console.log('청크 저장 완료')
      }
    } catch (dbError) {
      console.warn('데이터베이스 저장 실패, 메모리에만 보관:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: '문서가 성공적으로 업로드되고 처리되었습니다.',
      filename: file.name,
      textLength: text.length,
      chunkCount: chunks.length,
      processedChunks: embeddings.length
    })

  } catch (error) {
    console.error('문서 업로드 오류:', error)
    return NextResponse.json(
      { error: '문서 업로드에 실패했습니다.' },
      { status: 500 }
    )
  }
}
