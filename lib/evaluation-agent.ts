import { ChatOpenAI } from 'langchain/openai'
import { ChatPromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

// 평가 결과 스키마
export const EvaluationResultSchema = z.object({
  analytical_score_1: z.number().min(0).max(2).describe("분석적 채점 1 (과제수행: 내용의 적절성 및 완성도)"),
  analytical_score_2: z.number().min(0).max(2).describe("분석적 채점 2 (구성: 응집성 및 일관성)"),
  analytical_score_3: z.number().min(0).max(2).describe("분석적 채점 3 (언어사용: 어휘 및 어법의 정확성)"),
  holistic_score: z.enum(['A', 'B', 'C']).describe("총체적 채점 수준"),
  total_score: z.number().min(0).max(6).describe("총점 (6점 만점)"),
  ai_feedback: z.string().describe("AI 피드백")
})

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>

export class EvaluationAgent {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  }

  async evaluateAnswer(
    question: any,
    studentAnswer: string,
    studentName: string
  ): Promise<EvaluationResult> {
    const evaluationPrompt = ChatPromptTemplate.fromMessages([
      ["system", `당신은 초등 영어 평가 전문가입니다. 
주어진 평가 문항과 채점 기준을 바탕으로 학생의 서술형 답안을 평가하세요.

평가 기준:
1. 분석적 채점 기준 3개 영역 (각 0-2점, 총 6점 만점)
2. 총체적 채점 기준 (A, B, C 수준)

다음 JSON 형식으로 응답해주세요:
{
  "analytical_score_1": 0-2,
  "analytical_score_2": 0-2, 
  "analytical_score_3": 0-2,
  "holistic_score": "A" 또는 "B" 또는 "C",
  "total_score": 0-6,
  "ai_feedback": "개별화된 피드백 메시지"
}`],
      ["human", `
평가 문항: {question}
조건: {conditions}
학생 답안: {studentAnswer}
학생 이름: {studentName}

분석적 채점 기준:
1. {analytical_criteria_1}
2. {analytical_criteria_2}
3. {analytical_criteria_3}

총체적 채점 기준:
A 수준: {holistic_criteria_a}
B 수준: {holistic_criteria_b}
C 수준: {holistic_criteria_c}

성취수준별 예시 답안:
A 수준: {example_answer_a}
B 수준: {example_answer_b}  
C 수준: {example_answer_c}
`]
    ])

    const chain = evaluationPrompt.pipe(this.llm).pipe(new StringOutputParser())
    
    const result = await chain.invoke({
      question: question.question,
      conditions: question.conditions,
      studentAnswer,
      studentName,
      analytical_criteria_1: question.analytical_criteria_1,
      analytical_criteria_2: question.analytical_criteria_2,
      analytical_criteria_3: question.analytical_criteria_3,
      holistic_criteria_a: question.holistic_criteria_a,
      holistic_criteria_b: question.holistic_criteria_b,
      holistic_criteria_c: question.holistic_criteria_c,
      example_answer_a: question.example_answer_a,
      example_answer_b: question.example_answer_b,
      example_answer_c: question.example_answer_c,
    })

    try {
      // JSON 파싱
      const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsedResult = JSON.parse(cleanedResult)
      return EvaluationResultSchema.parse(parsedResult)
    } catch (error) {
      console.error('평가 결과 파싱 오류:', error)
      throw new Error('평가 결과를 파싱할 수 없습니다.')
    }
  }
}
