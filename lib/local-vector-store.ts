import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'
import path from 'path'
import fs from 'fs'

export class LocalVectorStore {
  private vectorStore: FaissStore | null = null
  private embeddings: OpenAIEmbeddings
  private documents: any[] = []
  private isInitialized = false

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  }

  async initialize() {
    if (!this.isInitialized) {
      try {
        console.log('로컬 벡터 스토어 로딩 시작...')
        
        // 벡터 스토어 파일 존재 확인
        const vectorStorePath = path.join(process.cwd(), 'vector_store')
        const faissPath = path.join(vectorStorePath, 'index.faiss')
        const pklPath = path.join(vectorStorePath, 'index.pkl')
        
        if (!fs.existsSync(faissPath) || !fs.existsSync(pklPath)) {
          throw new Error('벡터 스토어 파일을 찾을 수 없습니다.')
        }
        
        this.vectorStore = await FaissStore.load(vectorStorePath, this.embeddings)
        this.isInitialized = true
        console.log('로컬 벡터 스토어 로딩 완료')
      } catch (error) {
        console.error('벡터 스토어 로딩 오류:', error)
        throw new Error('벡터 스토어를 로드할 수 없습니다.')
      }
    }
    return this.vectorStore
  }

  async search(query: string, k: number = 8): Promise<Document[]> {
    try {
      const store = await this.initialize()
      const results = await store.similaritySearch(query, k)
      
      // 결과에 관련성 점수 추가
      const docsWithScores = results.map((doc, index) => {
        const relevanceScore = Math.max(0, 10 - index) // 순위 기반 점수
        return new Document({
          pageContent: doc.pageContent,
          metadata: {
            ...doc.metadata,
            relevanceScore,
            searchType: 'vector',
            source: doc.metadata?.source || 'local_vector_store'
          }
        })
      })

      console.log(`로컬 벡터 검색 완료: ${docsWithScores.length}개 문서`)
      return docsWithScores
    } catch (error) {
      console.error('로컬 벡터 검색 오류:', error)
      return []
    }
  }

  async searchWithScore(query: string, k: number = 8) {
    try {
      const store = await this.initialize()
      const results = await store.similaritySearchWithScore(query, k)
      
      return results.map(([doc, score]) => ({
        text: doc.pageContent,
        metadata: {
          ...doc.metadata,
          relevanceScore: score * 10, // 점수를 0-10 스케일로 변환
          searchType: 'vector',
          source: doc.metadata?.source || 'local_vector_store'
        }
      }))
    } catch (error) {
      console.error('로컬 벡터 검색 오류:', error)
      return []
    }
  }

  // 하이브리드 검색 (벡터 + 키워드)
  async hybridSearch(query: string, k: number = 8): Promise<Document[]> {
    try {
      // 벡터 검색
      const vectorResults = await this.search(query, k)
      
      // 키워드 검색 (간단한 구현)
      const keywords = query.split(' ').filter(word => word.length > 1)
      const keywordResults: Document[] = []
      
      if (keywords.length > 0) {
        const store = await this.initialize()
        // 각 키워드에 대해 검색
        for (const keyword of keywords) {
          const results = await store.similaritySearch(keyword, 2)
          keywordResults.push(...results.map(doc => new Document({
            pageContent: doc.pageContent,
            metadata: {
              ...doc.metadata,
              relevanceScore: 5, // 키워드 매치 점수
              searchType: 'keyword',
              source: doc.metadata?.source || 'local_vector_store'
            }
          })))
        }
      }

      // 결과 합치기 및 중복 제거
      const allResults = [...vectorResults, ...keywordResults]
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.pageContent === result.pageContent)
      )

      // 관련성 점수로 정렬
      return uniqueResults
        .sort((a, b) => (b.metadata?.relevanceScore || 0) - (a.metadata?.relevanceScore || 0))
        .slice(0, k)
    } catch (error) {
      console.error('하이브리드 검색 오류:', error)
      return []
    }
  }
}
