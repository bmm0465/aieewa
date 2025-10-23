import { OpenAIEmbeddings } from '@langchain/openai'
import { getServerSupabaseClient } from './supabase'

// OpenAI Embeddings 클라이언트 초기화
let embeddingsClient: OpenAIEmbeddings | null = null

function getEmbeddingsClient(): OpenAIEmbeddings {
  if (!embeddingsClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.')
    }
    
    embeddingsClient = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small', // 비용 효율적인 모델 사용
      batchSize: 100, // 배치 처리로 API 호출 최적화
    })
  }
  
  return embeddingsClient
}

// 텍스트 청크들을 벡터 임베딩으로 변환
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    console.log(`${texts.length}개 텍스트에 대한 임베딩 생성 시작`)
    
    const client = getEmbeddingsClient()
    const embeddings = await client.embedDocuments(texts)
    
    console.log(`임베딩 생성 완료: ${embeddings.length}개 벡터`)
    return embeddings
  } catch (error) {
    console.error('임베딩 생성 오류:', error)
    throw new Error(`임베딩 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// 단일 텍스트에 대한 벡터 임베딩 생성
export async function generateSingleEmbedding(text: string): Promise<number[]> {
  try {
    const client = getEmbeddingsClient()
    const embedding = await client.embedQuery(text)
    return embedding
  } catch (error) {
    console.error('단일 임베딩 생성 오류:', error)
    throw new Error(`임베딩 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

// 벡터 유사도 검색 (코사인 유사도)
export async function searchSimilarVectors(
  queryEmbedding: number[],
  limit: number = 10,
  threshold: number = 0.7
): Promise<Array<{
  chunk_text: string
  metadata: any
  similarity: number
}>> {
  try {
    const supabase = getServerSupabaseClient()
    
    // 모든 청크의 임베딩을 가져와서 유사도 계산
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('chunk_text, metadata, embedding')
      .not('embedding', 'is', null)
    
    if (error) {
      console.error('청크 조회 오류:', error)
      return []
    }
    
    if (!chunks || chunks.length === 0) {
      console.log('임베딩된 청크가 없습니다.')
      return []
    }
    
    // 코사인 유사도 계산
    const similarities = chunks.map(chunk => {
      if (!chunk.embedding || !Array.isArray(chunk.embedding)) {
        return { ...chunk, similarity: 0 }
      }
      
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding)
      return { ...chunk, similarity }
    })
    
    // 유사도 순으로 정렬하고 임계값 이상만 반환
    const results = similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
    
    console.log(`벡터 검색 결과: ${results.length}개 (임계값: ${threshold})`)
    return results
    
  } catch (error) {
    console.error('벡터 검색 오류:', error)
    return []
  }
}

// 코사인 유사도 계산 함수
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('벡터 차원이 일치하지 않습니다.')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// 배치로 임베딩 생성 및 저장
export async function processChunksWithEmbeddings(
  chunks: Array<{
    text: string
    metadata: any
    chunkIndex: number
  }>,
  documentId: string
): Promise<void> {
  try {
    const supabase = getServerSupabaseClient()
    
    // 배치 크기 설정 (API 제한 고려)
    const batchSize = 50
    const totalBatches = Math.ceil(chunks.length / batchSize)
    
    console.log(`${chunks.length}개 청크를 ${totalBatches}개 배치로 처리`)
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      
      console.log(`배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개 청크)`)
      
      try {
        // 텍스트 추출
        const texts = batch.map(chunk => chunk.text)
        
        // 임베딩 생성
        const embeddings = await generateEmbeddings(texts)
        
        // 데이터베이스에 저장
        const chunksToInsert = batch.map((chunk, index) => ({
          document_id: documentId,
          chunk_text: chunk.text,
          chunk_index: chunk.chunkIndex,
          metadata: chunk.metadata,
          embedding: embeddings[index] // 벡터 임베딩 저장
        }))
        
        const { error: insertError } = await supabase
          .from('document_chunks')
          .insert(chunksToInsert)
        
        if (insertError) {
          console.error(`배치 ${batchNumber} 저장 오류:`, insertError)
        } else {
          console.log(`배치 ${batchNumber} 저장 완료`)
        }
        
        // API 제한을 위한 지연
        if (batchNumber < totalBatches) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (batchError) {
        console.error(`배치 ${batchNumber} 처리 오류:`, batchError)
      }
    }
    
    console.log('모든 청크 임베딩 처리 완료')
    
  } catch (error) {
    console.error('청크 임베딩 처리 오류:', error)
    throw error
  }
}
