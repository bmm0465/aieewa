// Vercel 배포를 위한 최적화된 RAG 시스템
import { getServerSupabaseClient } from './supabase'
import { generateSingleEmbedding } from './embeddings'

export interface OptimizedSearchResult {
  text: string
  metadata: any
  relevanceScore: number
  searchType: 'vector' | 'keyword' | 'hybrid'
}

export class VercelOptimizedRAG {
  private supabase = getServerSupabaseClient()

  // Vercel 환경에 최적화된 검색
  async search(query: string, limit: number = 8): Promise<OptimizedSearchResult[]> {
    try {
      console.log('Vercel 최적화 RAG 검색 시작:', query)

      // 1. 빠른 키워드 검색 (백업)
      const keywordResults = await this.keywordSearch(query, Math.min(limit, 5))
      
      // 2. 벡터 검색 (가능한 경우)
      let vectorResults: OptimizedSearchResult[] = []
      try {
        vectorResults = await this.vectorSearch(query, Math.min(limit, 5))
      } catch (vectorError) {
        console.warn('벡터 검색 실패, 키워드 검색만 사용:', vectorError)
      }

      // 3. 결과 병합 및 정렬
      const allResults = [...vectorResults, ...keywordResults]
      const uniqueResults = this.deduplicateResults(allResults)
      
      // 4. 관련성 점수 기반 정렬
      const sortedResults = uniqueResults
        .sort((a, b) => {
          // 벡터 검색 결과 우선
          if (a.searchType === 'vector' && b.searchType === 'keyword') return -1
          if (a.searchType === 'keyword' && b.searchType === 'vector') return 1
          
          // 점수 순 정렬
          return b.relevanceScore - a.relevanceScore
        })
        .slice(0, limit)

      console.log(`검색 완료: ${sortedResults.length}개 결과 (벡터: ${vectorResults.length}, 키워드: ${keywordResults.length})`)
      return sortedResults

    } catch (error) {
      console.error('RAG 검색 오류:', error)
      return []
    }
  }

  // 키워드 검색 (빠른 백업)
  private async keywordSearch(query: string, limit: number): Promise<OptimizedSearchResult[]> {
    const keywords = query.split(' ').filter(word => word.length > 1)
    
    if (keywords.length === 0) return []

    try {
      // 특수문자 이스케이프 처리
      const escapedKeywords = keywords.map(keyword => 
        keyword.replace(/[%_\\]/g, '\\$&') // SQL 특수문자 이스케이프
      )
      
      // 간단한 키워드 검색 (복잡한 OR 쿼리 대신)
      const { data: chunks, error } = await this.supabase
        .from('document_chunks')
        .select('chunk_text, metadata')
        .limit(limit * 3) // 더 많이 가져와서 클라이언트에서 필터링

      if (error || !chunks) {
        console.error('키워드 검색 오류:', error)
        return []
      }

      // 클라이언트에서 키워드 매칭
      const filteredChunks = chunks.filter(chunk => {
        const text = chunk.chunk_text.toLowerCase()
        return escapedKeywords.some(keyword => text.includes(keyword.toLowerCase()))
      })

      return filteredChunks.map(chunk => ({
        text: chunk.chunk_text,
        metadata: chunk.metadata,
        relevanceScore: this.calculateKeywordScore(chunk.chunk_text, query, keywords),
        searchType: 'keyword' as const
      }))
    } catch (error) {
      console.error('키워드 검색 처리 오류:', error)
      return []
    }
  }

  // 벡터 검색 (제한적)
  private async vectorSearch(query: string, limit: number): Promise<OptimizedSearchResult[]> {
    try {
      // 쿼리 임베딩 생성
      const queryEmbedding = await generateSingleEmbedding(query)
      
      // 간단한 벡터 검색 (Supabase 벡터 확장 사용)
      const { data: chunks, error } = await this.supabase
        .from('document_chunks')
        .select('chunk_text, metadata, embedding')
        .not('embedding', 'is', null)
        .limit(limit * 3) // 더 많이 가져와서 유사도 계산

      if (error || !chunks) {
        throw new Error('벡터 데이터 조회 실패')
      }

      // 코사인 유사도 계산
      const results = chunks
        .map(chunk => {
          if (!chunk.embedding || !Array.isArray(chunk.embedding)) {
            return null
          }
          
          const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
          return {
            text: chunk.chunk_text,
            metadata: chunk.metadata,
            relevanceScore: similarity * 10, // 10배 스케일링
            searchType: 'vector' as const
          }
        })
        .filter(result => result !== null && result.relevanceScore > 0.5) // 임계값 필터링
        .sort((a, b) => b!.relevanceScore - a!.relevanceScore)
        .slice(0, limit)

      return results as OptimizedSearchResult[]

    } catch (error) {
      console.error('벡터 검색 오류:', error)
      return []
    }
  }

  // 중복 제거
  private deduplicateResults(results: OptimizedSearchResult[]): OptimizedSearchResult[] {
    const seen = new Set<string>()
    return results.filter(result => {
      const key = result.text.substring(0, 100) // 첫 100자로 중복 판단
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // 키워드 점수 계산
  private calculateKeywordScore(text: string, query: string, keywords: string[]): number {
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    const keywordsLower = keywords.map(k => k.toLowerCase())
    
    let score = 0
    
    // 키워드 매칭 점수
    keywordsLower.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 2
        if (queryLower.includes(keyword)) {
          score += 1
        }
      }
    })
    
    // 전체 쿼리 매칭 점수
    if (textLower.includes(queryLower)) {
      score += 3
    }
    
    // 청크 길이 정규화
    if (text.length < 50) score -= 1
    if (text.length > 2000) score -= 1
    
    return score
  }

  // 코사인 유사도 계산
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}
