// 기본 PDF 파일들을 Supabase에 미리 업로드하는 스크립트
// 로컬에서 한 번 실행하여 프로덕션 환경에서도 사용할 수 있도록 함

// 환경 변수 로드 (.env.local 파일)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const { readdir, readFile } = require('fs/promises')
const { join } = require('path')
const { existsSync } = require('fs')
// pdf-parse import - 완전히 다른 방식으로 수정
const pdfParseModule = require('pdf-parse')
const pdfParse = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    pdfParseModule(buffer, options)
      .then(resolve)
      .catch(reject)
  })
}
const { createClient } = require('@supabase/supabase-js')

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('환경 변수 확인:')
console.log('SUPABASE_URL 존재:', !!supabaseUrl)
console.log('SERVICE_ROLE_KEY 존재:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('')
  console.error('📋 다음 환경 변수들이 필요합니다:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('💡 해결 방법:')
  console.error('   1. .env.local 파일을 생성하고 환경 변수를 설정하세요')
  console.error('   2. 또는 수동으로 환경 변수를 설정한 후 실행하세요:')
  console.error('      $env:NEXT_PUBLIC_SUPABASE_URL="your_url"; $env:SUPABASE_SERVICE_ROLE_KEY="your_key"; npm run seed-pdfs')
  console.error('')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 간단한 텍스트 스플리터
function splitText(text, chunkSize = 1000, chunkOverlap = 200) {
  const chunks = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)
    
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

async function seedDefaultPdfs() {
  try {
    console.log('기본 PDF 파일 시드 시작...')
    
    const pdfFolderPath = join(process.cwd(), 'pdf')
    
    if (!existsSync(pdfFolderPath)) {
      console.error('pdf 폴더를 찾을 수 없습니다.')
      return
    }

    const files = await readdir(pdfFolderPath)
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))
    
    console.log(`발견된 PDF 파일: ${pdfFiles.length}개`)

    for (const filename of pdfFiles) {
      try {
        console.log(`처리 중: ${filename}`)
        
        const filePath = join(pdfFolderPath, filename)
        const fileBuffer = await readFile(filePath)
        
        const pdfData = await pdfParse(fileBuffer, {})
        const text = pdfData.text

        if (!text || text.trim().length === 0) {
          console.warn(`${filename}: 텍스트를 추출할 수 없습니다.`)
          continue
        }

        const chunks = splitText(text, 1000, 200)
        console.log(`${filename}: ${chunks.length}개 청크 생성`)

        // 문서 정보 저장
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .upsert({
            filename: `pdf/${filename}`,
            file_size: fileBuffer.length,
            text_content: text.substring(0, 10000),
            chunk_count: chunks.length,
            upload_time: new Date().toISOString(),
          }, {
            onConflict: 'filename'
          })
          .select()
          .single()

        if (docError) {
          console.error(`${filename} 문서 저장 오류:`, docError)
          continue
        }

        // 기존 청크들 삭제
        await supabase
          .from('document_chunks')
          .delete()
          .eq('document_id', docData.id)

        // 청크들 저장
        const chunksToInsert = chunks.map((chunk, index) => ({
          document_id: docData.id,
          chunk_text: chunk,
          chunk_index: index,
          metadata: {
            source: `pdf/${filename}`,
            chunkIndex: index,
            uploadTime: new Date().toISOString(),
            isDefault: true
          }
        }))

        const { error: chunkError } = await supabase
          .from('document_chunks')
          .insert(chunksToInsert)

        if (chunkError) {
          console.error(`${filename} 청크 저장 오류:`, chunkError)
        } else {
          console.log(`${filename}: ${chunks.length}개 청크 저장 완료`)
        }

      } catch (error) {
        console.error(`${filename} 처리 오류:`, error)
      }
    }

    console.log('기본 PDF 파일 시드 완료!')

  } catch (error) {
    console.error('시드 실행 오류:', error)
  }
}

seedDefaultPdfs()
