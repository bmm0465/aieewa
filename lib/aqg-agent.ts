import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate, FewShotPromptTemplate, PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { Document } from '@langchain/core/documents'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { AQG, AQGSchema, GraphStateAQG, JudgeContext, JudgeHallucinations } from './types/aqg'
import { getServerSupabaseClient } from './supabase'
import { VercelOptimizedRAG } from './vercel-optimized-rag'

// 환경 변수 설정
if (typeof window === 'undefined') {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY
}

// 문서 포맷 함수 (관련성 점수 포함)
function formatDocs(docs: Document[]): string {
  return docs.map((doc, index) => {
    const score = doc.metadata?.relevanceScore || 0
    const source = doc.metadata?.source || 'unknown'
    return `[문서 ${index + 1}] (관련성: ${score}, 출처: ${source})
${doc.pageContent}`;
  }).join("\n\n")
}

export class AQGAgent {
  private llmGen: ChatOpenAI
  private llmJudge: ChatOpenAI
  private retrieval?: any
  private parser: any
  private optimizedRAG?: VercelOptimizedRAG

  constructor() {
    // 환경 변수 체크
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.')
    }

    try {
      this.llmGen = new ChatOpenAI({
        modelName: "gpt-4o",
        temperature: 0.3,
        openAIApiKey: process.env.OPENAI_API_KEY,
      })

      this.llmJudge = new ChatOpenAI({
        modelName: "gpt-4o", 
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
      })

      this.parser = AQGSchema
    } catch (error) {
      console.error('AQGAgent 초기화 오류:', error)
      throw new Error('AI 모델 초기화에 실패했습니다.')
    }
  }

  // RAG 검색 초기화 (Vercel 최적화)
  async initializeRetrieval() {
    // Vercel 환경에서는 항상 최적화된 RAG 사용
    this.optimizedRAG = new VercelOptimizedRAG()
    this.retrieval = {
      invoke: async (query: string) => {
        try {
          console.log('Vercel 최적화 RAG 검색 시작:', query)
          const results = await this.optimizedRAG!.search(query, 8)
          
          const docs = results.map(result => new Document({
            pageContent: result.text,
            metadata: {
              ...result.metadata,
              relevanceScore: result.relevanceScore,
              searchType: result.searchType
            }
          }))
          
          console.log(`Vercel RAG 검색 완료: ${docs.length}개 문서`)
          return docs
        } catch (error) {
          console.error('Vercel RAG 검색 오류:', error)
          return []
        }
      }
    }
  }

  // Supabase 폴백 검색 함수
  async fallbackSupabaseSearch(query: string) {
    try {
      console.log('Supabase 폴백 검색 시작:', query)
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('Supabase 설정이 없어 빈 결과를 반환합니다.')
        return []
      }

      // 벡터 검색 시도
      const queryEmbedding = await generateSingleEmbedding(query)
      const results = await searchSimilarVectors(queryEmbedding, 8, 0.7)
      
      const docs = results.map(result => new Document({
        pageContent: result.chunk_text,
        metadata: {
          ...result.metadata,
          relevanceScore: result.similarity * 10,
          searchType: 'vector'
        }
      }))
      
      console.log(`Supabase 폴백 검색 완료: ${docs.length}개 문서`)
      return docs
    } catch (error) {
      console.error('Supabase 폴백 검색 오류:', error)
      return []
    }
  }

  // 키워드 점수 계산 헬퍼 메서드
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

  // RAG 기반 프롬프트 설정
  private getPromptTemplate() {
    const example_aqg = [
      {
        context: "context",
        request: "5학년 10단원 영어 서술형 평가 문항과 채점 기준을 생성해줘.",
        answer: `예시문: Food Festival
Can you come to the food festival?
The festival is on June 10th.
You can eat some food.
You can cook some food, too.
Please come to Green Park at 11.

평가 문항: 예시문을 참고하여 자신이 정한 행사에 초대하는 글을 쓰세요.

조건:
∙ Food Festival 이외의 행사를 정할 것
∙ 예시문의 밑줄 친 부분은 모두 다른 표현으로 바꿀 것
∙ 밑줄 친 부분 이외의 내용도 모두 쓸 것
∙ 대소문자, 철자법에 맞춰 쓸 것

모범 답안 1:
Robot Festival
Can you come to the robot festival?
The festival is on May 15th.
You can see many robots.
You can make your robots, too.
Please come to the Science Museum at 2.

모범 답안 2:
Book Festival
Can you come to the book festival?
The festival is on September 21st.
You can buy and sell books.
You can meet famous writer, too.
Please come to school library at 12.

분석적 채점 기준(과제수행: 내용의 적절성 및 완성도)
2점: 조건을 모두 충족하는 경우
1점: 조건을 모두 충족하지는 못하나 전체적으로 초대의 목적에 맞게 의미가 전달되는 경우
0점: 무응답 또는 초대의 목적에 맞게 의미가 전달되지 않는 경우

분석적 채점 기준(구성: 응집성 및 일관성)
2점: 글의 응집성과 일관성이 잘 갖추어져 있는 경우
1점: 글의 응집성과 일관성이 다소 미흡한 경우
0점: 무응답 또는 글의 응집성이 전혀 찾아볼 수 없는 경우

분석적 채점 기준(언어사용: 어휘 및 어법의 정확성)
2점: 대소문자, 어휘 및 어법 오류가 거의 없는 경우
1점: 대소문자, 어휘 및 어법 오류가 비교적 많은 경우
0점: 무응답 또는 대소문자, 어휘 및 어법 오류가 매우 많은 경우

총체적 채점 기준 A 수준: 글의 분량이 풍부하며 자신이 세운 계획을 바탕으로 자신의 행사에 관해 체계적으로 서술하였다. 전반적으로 자신이 개최하고자 하는 행사에 관하여 관련성이 높은 내용을 자료에서 선별하여 사용하였고, 응집성 및 일관성이 높아 완성도 있는 글을 작성하였다.

총체적 채점 기준 B 수준: 글의 분량이 적절하며 자신이 세운 계획을 바탕으로 자신의 행사에 관해 적절하게 서술하였다. 자신이 개최하고자 하는 행사에 관하여 관련성이 떨어지는 내용을 포함하거나 꼭 필요한 요소가 빠져 있어 응집성 및 일관성이 부족하고 완성도가 떨어진다.

총체적 채점 기준 C 수준: 글의 분량이 매우 부족하며 자신이 세운 계획을 바탕으로 구성되어 있지 않아 자신이 개최하고자 하는 행사에 관해 미흡하게 서술하였다. 행사에 관한 내용이 부분적으로 포함되어 있긴 하나 관련성이 떨어지는 내용을 포함하여 응집성 및 일관성이 부족하여 완성된 글로 보기 어렵다.

성취수준별 예시 답안 A 수준:
Robot Festival
Can you come to the robot festival?
The festival is on May 15th.
You can see many robots.
You can make your robots, too.
Please come to the Science Museum at 2.

성취수준별 예시 답안 B 수준:
Robot Festival
Can you come to the festival?
The festival is on Decemper 21th.
You can eat foods. You can play, too.
Please come to house 12.

성취수준별 예시 답안 C 수준:
Robot Festival
Can you come festival?
The festival Juny 1th.
You can play Please come 1

성취수준별 평가에 따른 예시 피드백 A: 자신이 생각한 행사에 대해 행사 이름, 날짜와 시간, 장소, 할 일을 계획하고 이에 대해 하나의 글로 작성하였습니다. 글의 흐름이 자연스럽고 어휘와 어법, 철자법과 대소문자의 오류가 없습니다. 다른 친구들의 글을 바꿔 읽고 서로 의견을 나누는 활동이 도움이 될 것입니다.

성취수준별 평가에 따른 예시 피드백 B: 자신이 계획한 행사에 대해 필요한 정보 중 일부만 서술했습니다. 그래서 글의 흐름이 부자연스럽습니다. 초대하는 글에 필요한 정보를 보충하여 자연스럽고 완성된 글의 형태로 작성해 보는 연습을 하세요. 의미는 이해할 수 있으나 어휘 및 어법, 철자법이나 대소문자 사용에 관해 실수가 보이므로 제출하기 전에 스스로 꼼꼼하게 살펴보세요. 다양한 행사 초대장을 찾아 읽어 보고, 그것을 따라 써 보기를 추천합니다.

성취수준별 평가에 따른 예시 피드백 C: 자신이 계획한 행사가 어떤 것인지에 대한 정보가 부족합니다. 초대하는 글에 들어가는 행사 이름, 날짜와 시간, 장소, 할 일에 대한 어휘를 학습하고 문장으로 쓰는 연습을 해 보세요. 그림과 함께 있는 쉽고 간단한 초대 글을 찾아 읽기를 추천합니다.`
      }
    ]

    const examplePrompt = new PromptTemplate({
      inputVariables: ["context", "request", "answer"],
      template: "context: {context} \n request: {request} \n answer: {answer}"
    })

    return new FewShotPromptTemplate({
      examples: example_aqg,
      examplePrompt: examplePrompt,
      prefix: `당신은 초등 영어 서술형 평가 문항 및 채점 기준을 전문적으로 개발하는 평가 전문가입니다. 
당신의 역할은 예시와 검색된 문서 내용을 바탕으로, 초등학생 수준에 적합하고 교육과정에 부합하는 평가 문항과 채점 기준을 생성하는 것입니다. 
문항과 채점 기준은 다음과 같은 조건을 충족해야 합니다: 
1) 사용되는 어휘와 문장 구성은 교과서 수준과 유사해야 합니다. 
2) 예시문이나 모범 답안의 주제나 내용은 창의적이고 초등학생이 흥미를 가질 수 있는 것이어야 합니다. 
3) 평가 문항과 채점 기준은 내용 타당도가 높도록 구성되어야 하며, 교육과정 성취기준에 부합해야 합니다. 
이러한 조건을 바탕으로, 적절한 평가 문항과 채점 기준을 생성해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "단원_및_학년": "단원과 학년 정보",
  "예시문": "평가에 사용할 예시문",
  "평가문항": "서술형 평가 문항",
  "조건": "서술형 평가 문항 조건",
  "모범_답안_1": "모범 답안 1",
  "모범_답안_2": "모범 답안 2",
  "분석적_채점_기준_1": "분석적 채점 기준 1",
  "분석적_채점_기준_2": "분석적 채점 기준 2",
  "분석적_채점_기준_3": "분석적 채점 기준 3",
  "총체적_채점_기준_A": "총체적 채점 기준 A",
  "총체적_채점_기준_B": "총체적 채점 기준 B",
  "총체적_채점_기준_C": "총체적 채점 기준 C",
  "성취수준별_예시_답안_A": "A 수준 예시 답안",
  "성취수준별_예시_답안_B": "B 수준 예시 답안",
  "성취수준별_예시_답안_C": "C 수준 예시 답안",
  "성취수준별_평가에_따른_예시_피드백_A": "A 수준 피드백",
  "성취수준별_평가에_따른_예시_피드백_B": "B 수준 피드백",
  "성취수준별_평가에_따른_예시_피드백_C": "C 수준 피드백"
}

아래는 평가 문항과 채점 기준 예시입니다.:`,
      suffix: "context: {context} \n request: {request} \n answer:",
      inputVariables: ["context", "request"]
    })
  }

  // 검색 작업
  async retrieve(state: GraphStateAQG): Promise<GraphStateAQG> {
    console.log("[AQG - RETRIEVE]")
    if (!this.retrieval) {
      await this.initializeRetrieval()
    }
    
    const docs = await this.retrieval.invoke(state.request)
    state.context = formatDocs(docs)
    return state
  }

  // 요청-문맥 관련성 판단
  async requestContextRelevanceJudge(state: GraphStateAQG): Promise<string> {
    console.log("[AQG - REQUEST-CONTEXT JUDGE]")
    
    const contextJudgePrompt = ChatPromptTemplate.fromMessages([
      ["system", `당신은 초등 영어 서술형 평가 문항과 채점 기준 개발 전문가입니다.
다음은 교사의 요청(request)이 있고, 이를 위해 검색된 문서(context)가 주어졌습니다.

요청과 문서의 관련성을 다음의 4점 척도를 기준으로 평가하세요:
1점: 관련성이 매우 낮음 - 문서 내용이 요청과 전혀 무관하거나 관련성이 매우 낮음
2점: 관련성이 낮음 - 문서 내용이 요청한 내용과 일부 관련이 있으나, 핵심적인 정보나 세부 사항이 부족함
3점: 관련성이 높음 - 문서 내용이 요청한 내용과 대부분 관련이 있으며, 주요 정보와 세부 사항을 포함하고 있음
4점: 관련성이 매우 높음 - 문서 내용이 요청한 내용과 완전히 일치하며, 요청한 모든 정보와 세부 사항을 포괄적으로 제공함

점수는 숫자로만 반환하세요.`],
      ["human", "요청: {request} \n 검색된 문서: {context}"]
    ])

    const chain = contextJudgePrompt.pipe(this.llmJudge).pipe(new StringOutputParser())
    const result = await chain.invoke({
      request: state.request,
      context: state.context
    })

    const score = parseInt(result.match(/\d+/)?.[0] || "1")
    console.log(`Request-Context Relevance Score: ${score}`)
    
    return score >= 3 ? "relevant" : "not relevant"
  }

  // 답안 생성
  async generate(state: GraphStateAQG): Promise<GraphStateAQG> {
    console.log("[AQG - GENERATE]")
    
    try {
      // 직접 문자열로 프롬프트 구성하여 템플릿 변수 문제 해결
      const systemMessage = `당신은 초등 영어 서술형 평가 문항 및 채점 기준을 전문적으로 개발하는 평가 전문가입니다. 
당신의 역할은 예시와 검색된 문서 내용을 바탕으로, 초등학생 수준에 적합하고 교육과정에 부합하는 평가 문항과 채점 기준을 생성하는 것입니다. 
문항과 채점 기준은 다음과 같은 조건을 충족해야 합니다: 
1) 사용되는 어휘와 문장 구성은 교과서 수준과 유사해야 합니다. 
2) 예시문이나 모범 답안의 주제나 내용은 창의적이고 초등학생이 흥미를 가질 수 있는 것이어야 합니다. 
3) 평가 문항과 채점 기준은 내용 타당도가 높도록 구성되어야 하며, 교육과정 성취기준에 부합해야 합니다. 

다음 JSON 형식으로 응답해주세요:
{
  "단원_및_학년": "단원과 학년 정보를 여기에 입력",
  "예시문": "평가에 사용할 예시문을 여기에 입력",
  "평가문항": "서술형 평가 문항을 여기에 입력",
  "조건": "서술형 평가 문항 조건을 여기에 입력",
  "모범_답안_1": "모범 답안 1을 여기에 입력",
  "모범_답안_2": "모범 답안 2를 여기에 입력",
  "분석적_채점_기준_1": "분석적 채점 기준 1을 여기에 입력",
  "분석적_채점_기준_2": "분석적 채점 기준 2를 여기에 입력",
  "분석적_채점_기준_3": "분석적 채점 기준 3을 여기에 입력",
  "총체적_채점_기준_A": "총체적 채점 기준 A를 여기에 입력",
  "총체적_채점_기준_B": "총체적 채점 기준 B를 여기에 입력",
  "총체적_채점_기준_C": "총체적 채점 기준 C를 여기에 입력",
  "성취수준별_예시_답안_A": "A 수준 예시 답안을 여기에 입력",
  "성취수준별_예시_답안_B": "B 수준 예시 답안을 여기에 입력",
  "성취수준별_예시_답안_C": "C 수준 예시 답안을 여기에 입력",
  "성취수준별_평가에_따른_예시_피드백_A": "A 수준 피드백을 여기에 입력",
  "성취수준별_평가에_따른_예시_피드백_B": "B 수준 피드백을 여기에 입력",
  "성취수준별_평가에_따른_예시_피드백_C": "C 수준 피드백을 여기에 입력"
}`

      const humanMessage = `검색된 문서 (관련성 점수와 함께):
${state.context || "검색된 문서가 없습니다."}

요청: ${state.request}

위 검색된 문서들을 참고하여, 특히 관련성이 높은 내용을 우선적으로 활용하여 적절한 평가 문항과 채점 기준을 생성해주세요. 큰 교과서 PDF의 내용도 충분히 반영하여 질 높은 문항을 만들어주세요.`

      // 직접 LLM 호출하여 템플릿 변수 문제 회피
      const messages = [
        new SystemMessage(systemMessage),
        new HumanMessage(humanMessage)
      ]

      console.log('LLM 호출 시작')
      const result = await this.llmGen.invoke(messages)
      
      console.log('LLM 응답 받음, 타입:', typeof result)
      
      // LangChain 응답 구조 확인
      let responseContent: string
      if (result && typeof result === 'object' && 'content' in result) {
        responseContent = String(result.content)
      } else {
        responseContent = String(result)
      }
      
      console.log('응답 콘텐츠 길이:', responseContent?.length || 0)

      if (!responseContent || responseContent === 'undefined' || responseContent === 'null') {
        throw new Error('LLM이 유효한 응답을 반환하지 않았습니다.')
      }

      console.log('JSON 파싱 시도 시작')
      
      // 더 robust한 JSON 파싱
      let cleanedResult = responseContent.trim()
      
      // 여러 패턴으로 JSON 추출 시도
      const jsonPatterns = [
        /```json\s*([\s\S]*?)\s*```/,
        /```\s*([\s\S]*?)\s*```/,
        /(\{[\s\S]*\})/
      ]
      
      for (const pattern of jsonPatterns) {
        const match = cleanedResult.match(pattern)
        if (match) {
          cleanedResult = match[1] || match[0]
          break
        }
      }
      
      // 마크다운 코드 블록 제거
      cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      console.log('정리된 JSON:', cleanedResult.substring(0, 200) + '...')
      
      let parsedResult
      try {
        parsedResult = JSON.parse(cleanedResult)
      } catch (parseError) {
        console.error('JSON.parse 실패:', parseError)
        console.log('시도한 JSON:', cleanedResult)
        
        // 마지막 시도: { 부터 } 까지 찾기
        const startIndex = cleanedResult.indexOf('{')
        const lastIndex = cleanedResult.lastIndexOf('}')
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          const jsonPart = cleanedResult.substring(startIndex, lastIndex + 1)
          console.log('부분 JSON 추출 시도:', jsonPart.substring(0, 100) + '...')
          parsedResult = JSON.parse(jsonPart)
        } else {
          throw parseError
        }
      }
      
      console.log('JSON 파싱 성공')
      
      // Zod 스키마 검증
      const validatedResult = AQGSchema.parse(parsedResult)
      console.log('스키마 검증 성공')
      
      state.answer = validatedResult
      return state
      
    } catch (error) {
      console.error('generate 메서드 전체 오류:', error)
      console.error('state.request:', state.request)
      console.error('state.context:', state.context)
      
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('authentication')) {
          throw new Error('OpenAI API 키 인증에 실패했습니다.')
        } else if (error.message.includes('rate limit')) {
          throw new Error('API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('네트워크 연결에 문제가 있습니다.')
        }
      }
      
      throw new Error(`문항 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  // 문맥-답안 관련성 판단
  async contextAnswerRelevanceJudge(state: GraphStateAQG): Promise<string> {
    console.log("[AQG - CONTEXT-ANSWER JUDGE]")
    
    const hallucinationJudgePrompt = ChatPromptTemplate.fromMessages([
      ["system", `당신은 초등 영어 서술형 평가 문항과 채점 기준 개발 전문가입니다. 
다음은 생성된 평가 문항과 채점 기준(answer)이 검색된 문서(context)를 기반으로 작성되었는지 확인하는 평가입니다.

이 평가는 '문서 기반성(factual grounding)'과 '창의적 변형의 허용 범위'를 함께 고려해야 합니다.
형식, 구조, 평가 관점은 유지하되, 예시문이나 주제 등이 창의적으로 재구성되는 것은 허용됩니다.

다음의 4점 척도 기준에 따라 평가하세요:
1점: 생성된 대부분의 내용이 검색된 문서의 핵심 정보와 일치하지 않음. 문서와 무관한 주제나 구조가 다수 포함됨.
2점: 일부 요소는 문서 내용을 따르나, 핵심 평가 문항 구조 또는 기준이 왜곡되거나 근거 없이 크게 변경됨.
3점: 문서의 핵심 주제와 구조를 바탕으로 적절히 변형되었으며, 평가 목적과 형식은 대부분 유지됨.
4점: 문서의 핵심 정보와 평가 구조를 충실히 반영하면서도, 예시문 등에서 창의적으로 잘 변형되었음. 교육적으로 적절하고 실용적임.

점수는 숫자로만 반환하세요.`],
      ["human", "검색된 문서: {context} \n 생성된 평가 문항과 채점 기준: {answer}"]
    ])

    const answerText = state.answer ? JSON.stringify(state.answer, null, 2) : ""
    
    const chain = hallucinationJudgePrompt.pipe(this.llmJudge).pipe(new StringOutputParser())
    const result = await chain.invoke({
      context: state.context,
      answer: answerText
    })

    const score = parseInt(result.match(/\d+/)?.[0] || "1")
    console.log(`Context-Answer Relevance Score: ${score}`)
    
    return score >= 3 ? "finish" : "hallucination"
  }

  // 요청 재작성 (낮은 관련성)
  async requestRewriterLowContext(state: GraphStateAQG): Promise<GraphStateAQG> {
    console.log("[AQG - TRANSFORM REQUEST(low context)]")
    
    const rewriterPrompt = ChatPromptTemplate.fromMessages([
      ["system", `검색된 문서와 요청의 관련성이 낮습니다. 요청을 벡터 검색 시스템이 더 정확하게 문서를 검색할 수 있도록 다음과 같이 바꿔주세요:
- 요청의 핵심 주제와 목적을 명확하게 표현
- 불필요하거나 모호한 표현 제거
- 단원, 학년, 주제 키워드 강조
- 예시문 내용과 관련된 핵심 개념이 드러나도록

재작성된 요청은 문서 검색 정확도를 높이는 것을 목표로 합니다.`],
      ["human", "요청: {request}"]
    ])

    const chain = rewriterPrompt.pipe(this.llmGen).pipe(new StringOutputParser())
    state.request = await chain.invoke({ request: state.request })
    return state
  }

  // 요청 재작성 (높은 환각)
  async requestRewriterHighHallucination(state: GraphStateAQG): Promise<GraphStateAQG> {
    console.log("[AQG - TRANSFORM REQUEST(high hallucination)]")
    
    const rewriterPrompt = ChatPromptTemplate.fromMessages([
      ["system", `생성된 평가 문항과 채점 기준이 검색된 문서에 제대로 기반하지 않았습니다. 
이 문제를 해결하기 위해, 요청을 다음과 같은 방향으로 바꿔주세요:
- 요청 목적을 더 구체적으로 설명
- 참고할 문서의 주제나 내용 키워드를 명확히 제시
- 예시문, 단원, 학년 등에서 반드시 포함되어야 하는 핵심 정보 포함

요청은 생성 결과가 문서에 충실하게 기초할 수 있도록 유도해야 합니다.`],
      ["human", "요청: {request}"]
    ])

    const chain = rewriterPrompt.pipe(this.llmGen).pipe(new StringOutputParser())
    state.request = await chain.invoke({ request: state.request })
    return state
  }

  // 메인 워크플로 실행
  async run(request: string): Promise<AQG> {
    try {
      console.log('AQG Agent run 시작:', request)
      
      await this.initializeRetrieval()
      console.log('Retrieval 초기화 완료')
      
      let state: GraphStateAQG = { request, context: "" }
      let retryCount = 0
      const maxRetries = 2 // 재시도 횟수 줄임

      while (retryCount < maxRetries) {
        try {
          console.log(`AQG 워크플로 시도 ${retryCount + 1}/${maxRetries}`)
          
          // 1. 검색
          state = await this.retrieve(state)
          console.log('검색 단계 완료')
          
          // 2. 요청-문맥 관련성 판단 (간소화)
          try {
            const relevance = await this.requestContextRelevanceJudge(state)
            console.log('관련성 판단:', relevance)
            if (relevance === "not relevant") {
              state = await this.requestRewriterLowContext(state)
              continue
            }
          } catch (judgeError) {
            console.warn('관련성 판단 오류, 계속 진행:', judgeError)
          }
          
          // 3. 답안 생성
          state = await this.generate(state)
          console.log('문항 생성 완료:', !!state.answer)
          
          if (state.answer) {
            // 4. 문맥-답안 관련성 판단 (간소화)
            try {
              const hallucinationResult = await this.contextAnswerRelevanceJudge(state)
              console.log('환각 판단:', hallucinationResult)
              if (hallucinationResult === "finish") {
                break
              }
            } catch (judgeError) {
              console.warn('환각 판단 오류, 생성된 결과 사용:', judgeError)
              break // 생성된 결과가 있으면 사용
            }
          }
          
          retryCount++
        } catch (stepError) {
          console.error(`AQG 워크플로 단계 ${retryCount + 1} 오류:`, stepError)
          retryCount++
          
          // 마지막 시도에서도 실패하면 간단한 생성 시도
          if (retryCount >= maxRetries) {
            try {
              console.log('간단한 문항 생성 시도')
              state = await this.generate(state)
              if (state.answer) {
                console.log('간단한 생성 성공')
                break
              }
            } catch (simpleError) {
              console.error('간단한 생성도 실패:', simpleError)
            }
          }
        }
      }

      console.log('AQG 워크플로 완료, 결과:', !!state.answer)

      if (!state.answer) {
        throw new Error('문항 생성을 완료할 수 없습니다. 요청을 다시 확인해주세요.')
      }

      return state.answer
    } catch (error) {
      console.error('AQG Agent 전체 실행 오류:', error)
      throw new Error(`문항 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }
}
