import { ChatOpenAI } from 'langchain/openai'
import { ChatPromptTemplate, FewShotPromptTemplate, PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/output_parsers'
import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers'
import { FAISS } from 'langchain/vectorstores/faiss'
import { Document } from 'langchain/document'
import { AAS, AASSchema, GraphStateAAS, JudgeHallucinationsAAS, JudgeFeedbackAAS } from './types/aas'

// 환경 변수 설정
if (typeof window === 'undefined') {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY
}

// 문서 포맷 함수
function formatDocs(docs: Document[]): string {
  return docs.map(doc => doc.pageContent).join("\n\n")
}

export class AASAgent {
  private llm: ChatOpenAI
  private retrieval?: any
  private parser: any

  constructor() {
    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    this.parser = AASSchema
  }

  // RAG 검색 설정 (실제 구현에서는 벡터 스토어를 로드해야 함)
  async initializeRetrieval() {
    try {
      // 실제 환경에서는 Excel 파일이나 데이터베이스에서 채점 기준을 로드
      // criteria_df = pd.read_excel("평가 문항 및 채점 기준.xlsx")
      // 임시로 빈 검색기 설정
      this.retrieval = {
        invoke: async () => []
      }
    } catch (error) {
      console.error('AAS RAG 초기화 실패:', error)
      this.retrieval = {
        invoke: async () => []
      }
    }
  }

  // Few-shot 예시 구성
  private getExamples() {
    return [
      {
        "criteria": "criteria",
        "request": "5학년 11단원 평가 문항과 채점 기준을 바탕으로 지상우 학생의 답안: 's'을 채점하고 피드백을 생성해줘.",
        "answer": `이름: 지상우
답안: s
과제_수행: 0
과제_수행_채점_근거: 문항에서 요구하는 내용을 전혀 작성하지 않음
내용_구성: 0
내용_구성_채점_근거: 의미 있는 내용이 없어 구성이 불가능
언어_사용_정확성: 0
언어_사용_정확성_채점_근거: 완전한 문장이 아닌 단일 문자의 입력
총점: 0
총체적_채점: C(하) 수준
피드백: 답안을 더 완성도 있게 작성해 보세요. 주어진 문항에 맞는 내용을 생각해보고 여러 문장으로 표현해보세요.`
      },
      {
        "criteria": "criteria",
        "request": "5학년 11단원 평가 문항과 채점 기준을 바탕으로 김찬목 학생의 답안: 'I wnat to be a fixe 유튜버 I like to bike I want Moon teak wan'을 채점하고 피드백을 생성해줘.",
        "answer": `이름: 김찬목
답안: I wnat to be a fixe 유튜버 I like to bike I want Moon teak wan
과제_수행: 1
과제_수행_채점_근거: 주제는 표현했으나 연결어와 이유 설명이 부족
내용_구성: 0
내용_구성_채점_근거: 문장 간 연결성이 없고 일관성이 부족
언어_사용_정확성: 0
언어_사용_정확성_채점_근거: 철자 오류가 많고 문장 구조가 부정확
총점: 1
총체적_채점: C(하) 수준
피드백: 좋은 시작이에요! 꿈에 대해 말하고 있지만, 더 자세한 이유와 연결어를 사용해서 문장들을 연결해 보세요. 철자도 다시 한 번 확인해 주세요.`
      },
      {
        "criteria": "criteria",
        "request": "5학년 11단원 평가 문항과 채점 기준을 바탕으로 김태영 학생의 답안: 'I want to be a engineer. Engieer is greet! But engineer is hard. I like engineer.'을 채점하고 피드백을 생성해줘.",
        "answer": `이름: 김태영
답안: I want to be a engineer. Engieer is greet! But engineer is hard. I like engineer.
과제_수행: 1
과제_수행_채점_근거: 주제와 간단한 이유 제시, 하지만 구체적인 설명 부족
내용_구성: 1
내용_구성_채점_근거: 기본적인 구성은 있으나 문장 간 연결성이 다소 부족
언어_사용_정확성: 1
언어_사용_정확성_채점_근거: 일부 철자 오류가 있으나 전반적으로 이해 가능
총점: 3
총체적_채점: B(중) 수준
피드백: 엔지니어가 되고 싶은 이유를 잘 표현했어요. 철자를 조금 더 정확하게 쓰고, 더 구체적인 이유도 추가해 보세요.`
      }
    ]
  }

  // RAG 기반 프롬프트 설정
  private getPromptTemplate() {
    const examples = this.getExamples()

    const examplePrompt = new PromptTemplate({
      inputVariables: ["criteria", "request", "answer"],
      template: "criteria: {criteria} \n request: {request} \n answer: {answer}"
    })

    return new FewShotPromptTemplate({
      examples: examples,
      examplePrompt: examplePrompt,
      prefix: `당신은 초등 영어 서술형 평가 문항의 전문 채점자이며, 주어진 채점 기준에 따라 **정확하고 일관된 평가**를 수행해야 합니다.
모든 판단은 명시된 채점 기준(criteria)에 근거하여 항목별로 평가하고, 그 결과를 바탕으로 총체적인 수준(A/B/C)을 결정해야 합니다.
피드백은 학생이 이해하기 쉬운 문장으로 작성하되, 평가 항목별로 구체적인 강점과 개선점을 함께 제시해야 합니다.
무응답이나 문항과 무관한 내용 작성 시, 기준에 따라 점수를 엄격하게 부여하고, 그에 맞는 피드백을 작성해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "이름": "학생 이름",
  "답안": "학생의 답안",
  "과제_수행": 0-2,
  "과제_수행_채점_근거": "채점 근거",
  "내용_구성": 0-2,
  "내용_구성_채점_근거": "채점 근거",
  "언어_사용_정확성": 0-2,
  "언어_사용_정확성_채점_근거": "채점 근거",
  "총점": "총점",
  "총체적_채점": "A/B/C 수준",
  "피드백": "학생 피드백"
}

아래는 채점 예시입니다.:`,
      suffix: "criteria: {criteria} \n request: {request} \n answer:",
      inputVariables: ["criteria", "request"]
    })
  }

  // 검색 작업
  async retrieve(state: GraphStateAAS): Promise<GraphStateAAS> {
    console.log("[AAS - RETRIEVE]")
    if (!this.retrieval) {
      await this.initializeRetrieval()
    }
    
    const docs = await this.retrieval.invoke(state.request)
    state.criteria = formatDocs(docs)
    return state
  }

  // 답안 생성
  async generate(state: GraphStateAAS): Promise<GraphStateAAS> {
    console.log("[AAS - GENERATE]")
    
    const prompt = this.getPromptTemplate()
    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())
    
    const result = await chain.invoke({
      criteria: state.criteria,
      request: state.request
    })

    try {
      // JSON 파싱
      const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsedResult = JSON.parse(cleanedResult)
      state.answer = AASSchema.parse(parsedResult)
    } catch (error) {
      console.error('AAS 답안 파싱 실패:', error)
      throw new Error('생성된 답안을 파싱할 수 없습니다.')
    }

    return state
  }

  // 채점 정확성 판단
  async criteriaAnswerRelevanceJudge(state: GraphStateAAS): Promise<number> {
    console.log("[AAS - CRITERIA-ANSWER JUDGE]")
    
    const hallucinationJudgePrompt = ChatPromptTemplate.fromMessages([
      ["system", `당신은 초등 영어 서술형 평가 자동 채점 결과의 정확성을 평가하는 전문가입니다.
다음은 채점 기준(criteria), 그리고 LLM이 생성한 채점 결과(answer)입니다.

당신의 임무는 LLM의 채점 결과가:
1) 채점 기준을 얼마나 충실히 반영하고 있는지
2) 일관된 평가가 이루어졌는지를 평가하는 것입니다.

다음의 4점 척도에 따라 평가하세요:
1점: 채점 기준과 일치하지 않음. 판단 오류가 많고 핵심 항목이 누락됨
2점: 일부 기준은 반영되었으나, 중요한 부분에서 차이를 보임
3점: 전반적으로 기준과 일치하나 세부 항목에서 일부 오차가 존재함
4점: 채점 기준을 충실히 반영하며, 판단과 설명이 모두 일관되고 정확함

점수는 숫자만 반환하세요.`],
      ["human", "채점 기준: {criteria} \n LLM 채점 결과: {answer}"]
    ])

    const answerText = state.answer ? JSON.stringify(state.answer, null, 2) : ""
    
    const chain = hallucinationJudgePrompt.pipe(this.llm).pipe(new StringOutputParser())
    const result = await chain.invoke({
      criteria: state.criteria,
      answer: answerText
    })

    const score = parseInt(result.match(/\d+/)?.[0] || "1")
    console.log(`Criteria-Answer Relevance Score: ${score}`)
    
    return score
  }

  // 피드백 품질 판단
  async feedbackQualityJudge(state: GraphStateAAS): Promise<number> {
    console.log("[AAS - FEEDBACK QUALITY JUDGE]")
    
    const feedbackJudgePrompt = ChatPromptTemplate.fromMessages([
      ["system", `당신은 초등 영어 서술형 평가의 피드백 품질을 평가하는 전문가입니다.
다음은 학생들의 서술형 답안 채점 및 피드백 생성 결과(answer)입니다.
특히 피드백 항목이 다음 기준에 얼마나 잘 부합하는지를 평가하세요.

[피드백 평가 기준]
1. 피드백은 학습자의 실제 답안 내용을 바탕으로 작성되었는가?
2. 피드백이 평가 기준 항목(예: 과제 수행, 응집성, 언어 사용)을 반영하고 있는가?
3. 다음 세 가지 질문에 대한 답을 포함하는가?
   - 무엇을 잘했는가?
   - 무엇을 개선해야 하는가?
   - 어떻게 개선할 수 있는가?
4. 피드백이 교정 가능한 구체적 제안(예: 문장 고치기, 어휘 바꾸기 등)을 포함하는가?
5. 피드백 문장이 초등학생 수준에 맞게 간결하고 명확하며, 긍정적인 표현으로 구성되어 있는가?
   예: '~해 보세요', '~할 수 있어요' 등의 권유적 표현 사용 여부

아래의 4점 척도 기준에 따라 피드백의 품질을 평가하세요:
1점: 기준을 거의 충족하지 않음. 피드백이 모호하거나 문맥과 무관함
2점: 일부 기준은 충족하지만 중요한 요소가 누락됨
3점: 대부분의 기준을 충족하나 다소 구체성이나 표현상의 미흡함이 있음
4점: 모든 기준을 충실히 반영하며, 구체적이고 학생 수준에 맞는 피드백으로 구성됨

점수는 숫자만 반환하세요.`],
      ["human", "채점 및 피드백 생성 결과: {answer}"]
    ])

    const answerText = state.answer ? JSON.stringify(state.answer, null, 2) : ""
    
    const chain = feedbackJudgePrompt.pipe(this.llm).pipe(new StringOutputParser())
    const result = await chain.invoke({
      answer: answerText
    })

    const score = parseInt(result.match(/\d+/)?.[0] || "1")
    console.log(`Feedback Quality Score: ${score}`)
    
    return score
  }

  // 요청 재작성 (높은 환각)
  async requestRewriterHighHallucination(state: GraphStateAAS): Promise<GraphStateAAS> {
    console.log("[AAS - TRANSFORM REQUEST(high hallucination)]")
    
    const rewriterPrompt = ChatPromptTemplate.fromMessages([
      ["system", `LLM이 생성한 채점 결과가 채점 기준이나 교사 채점 예시와 일치하지 않아 채점 정확도와 신뢰도가 낮게 평가되었습니다.

다음은 기존 요청(request)입니다. 이 요청을 다음의 기준에 따라 수정하세요:

1. 채점 기준(예: 과제 수행, 내용 구성, 언어 사용 정확성)에 따라 채점이 이루어질 수 있도록 요청 내용을 구체화하세요.
2. 학생의 답안에서 평가해야 할 핵심 요소(예: 주제 표현, 이유 설명, 문장 구조 등)를 명확하게 지시하세요.
3. 교사 채점 예시에서 반복적으로 나타나는 표현이나 구성 방식이 드러나도록 유도하세요.
4. '정확하고 일관된 채점 결과'가 나올 수 있도록 LLM의 판단 기준을 명확히 설정하는 문장을 포함하세요.

수정된 요청은 채점 결과의 정확성과 신뢰도를 높이기 위한 것입니다.`],
      ["human", "요청: {request}"]
    ])

    const chain = rewriterPrompt.pipe(this.llm).pipe(new StringOutputParser())
    state.request = await chain.invoke({ request: state.request })
    return state
  }

  // 요청 재작성 (낮은 피드백 품질)
  async requestRewriterLowFeedback(state: GraphStateAAS): Promise<GraphStateAAS> {
    console.log("[AAS - TRANSFORM REQUEST(low feedback)]")
    
    const rewriterPrompt = ChatPromptTemplate.fromMessages([
      ["system", `LLM이 생성한 피드백이 다음 기준에 미흡하여 낮은 점수를 받았습니다:
- 학습자의 실제 답안에 근거한 맞춤형 피드백 여부
- 채점 기준(과제 수행, 내용 구성, 언어 사용)의 반영 정도
- 구체적 강점 및 개선점 제시 여부
- 교정 가능한 제안(예: 문장 수정, 표현 보완 등) 포함 여부
- 초등학생 수준에 맞는 간결하고 긍정적인 표현 사용 여부

이제 아래의 요청(request)을 다음 기준에 따라 수정하세요:

1. 피드백이 채점 기준 항목별로 진단과 제안을 줄 수 있도록 요청을 구체화하세요.
2. 학생이 무엇을 잘했는지, 어떤 점을 개선해야 하는지, 어떻게 개선할 수 있는지를 유도하세요.
3. 초등학생 눈높이에 맞는 문장과 표현(예: '~해 보세요', '~할 수 있어요')이 포함되도록 하세요.
4. LLM이 단순 평가가 아닌 교육적 피드백을 제공하도록 요청문을 교육 중심으로 강화하세요.

수정된 요청은 피드백의 질과 교육적 효과를 높이기 위한 것입니다.`],
      ["human", "요청: {request}"]
    ])

    const chain = rewriterPrompt.pipe(this.llm).pipe(new StringOutputParser())
    state.request = await chain.invoke({ request: state.request })
    return state
  }

  // 메인 워크플로 실행
  async run(request: string): Promise<AAS> {
    await this.initializeRetrieval()
    
    let state: GraphStateAAS = { request, criteria: "" }
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        // 1. 검색
        state = await this.retrieve(state)
        
        // 2. 답안 생성
        state = await this.generate(state)
        
        // 3. 채점 정확성 및 피드백 품질 판단
        const relevanceScore = await this.criteriaAnswerRelevanceJudge(state)
        
        if (relevanceScore >= 3) {
          const feedbackScore = await this.feedbackQualityJudge(state)
          
          if (feedbackScore >= 3) {
            break // 완료
          } else {
            state = await this.requestRewriterLowFeedback(state)
          }
        } else {
          state = await this.requestRewriterHighHallucination(state)
        }
        
        retryCount++
      } catch (error) {
        console.error('AAS 워크플로 오류:', error)
        retryCount++
      }
    }

    if (!state.answer) {
      throw new Error('채점을 완료할 수 없습니다.')
    }

    return state.answer
  }
}
