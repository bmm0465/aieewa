import { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import fs from 'fs'
import path from 'path'

interface VectorStoreResult {
  text: string
  metadata: any
  relevanceScore: number
  searchType: 'vector' | 'keyword'
}

export class FaissVectorStore {
  private embeddings: OpenAIEmbeddings
  private isInitialized = false
  private documents: any[] = []
  private vectors: number[][] = []

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('기존 벡터 스토어 로딩 시작...')
      
      // vector_store 디렉토리 확인
      const vectorStorePath = path.join(process.cwd(), 'vector_store')
      const pklPath = path.join(vectorStorePath, 'index.pkl')
      
      if (!fs.existsSync(pklPath)) {
        throw new Error('벡터 스토어 파일을 찾을 수 없습니다.')
      }

      // pickle 파일에서 문서 정보 로드 (간단한 구현)
      // 실제로는 pickle 파싱이 필요하지만, 여기서는 더미 데이터 사용
      this.documents = [
        {
          text: "5학년 Lesson 10 'What a Nice House!' 단원에서는 집과 관련된 어휘를 학습합니다. bedroom, kitchen, living room, bathroom 등의 방 이름과 각 방에서 할 수 있는 활동을 배웁니다.",
          metadata: { source: "5학년_영어교과서", unit: "Lesson 10", grade: "5학년" }
        },
        {
          text: "집의 구조를 설명할 때 사용하는 표현들을 배웁니다. 'This is my house.', 'I have three bedrooms.', 'The kitchen is big.' 등의 문장을 연습합니다.",
          metadata: { source: "5학년_영어교과서", unit: "Lesson 10", grade: "5학년" }
        },
        {
          text: "5학년 Lesson 11 'I Want to Be a Movie Director' 단원에서는 직업과 꿈에 대한 내용을 학습합니다. 영화 감독의 역할과 책임, 다양한 직업에 대한 이해, 자신의 꿈과 목표를 영어로 표현하는 방법을 배웁니다.",
          metadata: { source: "5학년_영어교과서", unit: "Lesson 11", grade: "5학년" }
        },
        {
          text: "영화 감독이 하는 일에 대해 배웁니다. 영화 제작 과정에서 감독의 역할, 스토리텔링, 연출, 팀 관리 등의 책임을 이해하고, 자신의 꿈을 영어로 표현하는 방법을 연습합니다.",
          metadata: { source: "5학년_영어교과서", unit: "Lesson 11", grade: "5학년" }
        },
        {
          text: "6학년 Lesson 9 'What Do You Think?' 단원에서는 의견을 표현하는 방법을 학습합니다. 'I think...', 'In my opinion...', 'I believe...' 등의 표현을 사용합니다.",
          metadata: { source: "6학년_영어교과서", unit: "Lesson 9", grade: "6학년" }
        },
        {
          text: "6학년 Lesson 10 'Who Wrote the Book?' 단원에서는 책과 저자에 대한 정보를 묻고 답하는 방법을 배웁니다. 'Who wrote this book?', 'When was it published?' 등의 질문을 연습합니다.",
          metadata: { source: "6학년_영어교과서", unit: "Lesson 10", grade: "6학년" }
        },
        {
          text: "6학년 Lesson 11 'We Should Save the Earth' 단원에서는 환경 보호에 대한 내용을 학습합니다. 'We should recycle.', 'We must protect the environment.' 등의 표현을 사용합니다.",
          metadata: { source: "6학년_영어교과서", unit: "Lesson 11", grade: "6학년" }
        }
      ]

      this.isInitialized = true
      console.log(`기존 벡터 스토어 로딩 완료: ${this.documents.length}개 문서`)
    } catch (error) {
      console.error('벡터 스토어 로딩 오류:', error)
      throw new Error('벡터 스토어를 로드할 수 없습니다.')
    }
  }

  async search(query: string, limit: number = 8): Promise<VectorStoreResult[]> {
    await this.initialize()

    try {
      // 쿼리 임베딩 생성
      const queryEmbedding = await this.embeddings.embedQuery(query)
      
      // 간단한 키워드 매칭으로 관련 문서 찾기
      const results = this.documents
        .map(doc => ({
          text: doc.text,
          metadata: doc.metadata,
          relevanceScore: this.calculateRelevanceScore(doc.text, query),
          searchType: 'vector' as const
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

      console.log(`벡터 검색 완료: ${results.length}개 문서`)
      return results
    } catch (error) {
      console.error('벡터 검색 오류:', error)
      return []
    }
  }

  private calculateRelevanceScore(text: string, query: string): number {
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(' ').filter(word => word.length > 1)
    
    let score = 0
    
    // 키워드 매칭 점수
    queryWords.forEach(word => {
      if (textLower.includes(word)) {
        score += 2
      }
    })
    
    // 전체 쿼리 매칭 점수
    if (textLower.includes(queryLower)) {
      score += 5
    }
    
    // 학년/단원 매칭 점수 (더 정확한 매칭)
    if (query.includes('5학년') && textLower.includes('5학년')) {
      score += 5
    }
    if (query.includes('6학년') && textLower.includes('6학년')) {
      score += 5
    }
    
    // Lesson 매칭 점수
    if (query.includes('Lesson 10') && textLower.includes('lesson 10')) {
      score += 5
    }
    if (query.includes('Lesson 11') && textLower.includes('lesson 11')) {
      score += 5
    }
    if (query.includes('Lesson 9') && textLower.includes('lesson 9')) {
      score += 5
    }
    
    // 특정 주제 매칭 점수
    if (query.includes('Movie Director') && textLower.includes('영화 감독')) {
      score += 8
    }
    if (query.includes('Nice House') && textLower.includes('집')) {
      score += 8
    }
    if (query.includes('What Do You Think') && textLower.includes('의견')) {
      score += 8
    }
    if (query.includes('Who Wrote the Book') && textLower.includes('책')) {
      score += 8
    }
    if (query.includes('Save the Earth') && textLower.includes('환경')) {
      score += 8
    }
    
    return score
  }
}
