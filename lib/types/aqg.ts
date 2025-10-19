import { z } from 'zod'

// AQG 스키마 정의 (Pydantic에서 Zod로 변환)
export const AQGSchema = z.object({
  단원_및_학년: z.string().describe("단원과 학년"),
  예시문: z.string().describe("평가에 사용할 예시문"),
  평가문항: z.string().describe("서술형 평가 문항"),
  조건: z.string().describe("서술형 평가 문항 조건"),
  모범_답안_1: z.string().describe("모범 답안 1"),
  모범_답안_2: z.string().describe("모범 답안 2"),
  분석적_채점_기준_1: z.string().describe("답안에 대한 분석적 채점 기준 1의 점수와 점수별 예상 수행"),
  분석적_채점_기준_2: z.string().describe("답안에 대한 분석적 채점 기준 2의 점수와 점수별 예상 수행"),
  분석적_채점_기준_3: z.string().describe("답안에 대한 분석적 채점 기준 3의 점수와 점수별 예상 수행"),
  총체적_채점_기준_A: z.string().describe("총체적 채점 기준의 A 수준"),
  총체적_채점_기준_B: z.string().describe("총체적 채점 기준의 B 수준"),
  총체적_채점_기준_C: z.string().describe("총체적 채점 기준의 C 수준"),
  성취수준별_예시_답안_A: z.string().describe("성취 수준에 따른 A 수준의 예시 답안"),
  성취수준별_예시_답안_B: z.string().describe("성취 수준에 따른 B 수준의 예시 답안"),
  성취수준별_예시_답안_C: z.string().describe("성취 수준에 따른 C 수준의 예시 답안"),
  성취수준별_평가에_따른_예시_피드백_A: z.string().describe("답안 평가에 따른 A 수준의 예시 피드백"),
  성취수준별_평가에_따른_예시_피드백_B: z.string().describe("답안 평가에 따른 B 수준의 예시 피드백"),
  성취수준별_평가에_따른_예시_피드백_C: z.string().describe("답안 평가에 따른 C 수준의 예시 피드백"),
})

export type AQG = z.infer<typeof AQGSchema>

export const JudgeContextSchema = z.object({
  score: z.number().min(1).max(4).describe("1~4")
})

export const JudgeHallucinationsSchema = z.object({
  score: z.number().min(1).max(4).describe("1~4")
})

export type JudgeContext = z.infer<typeof JudgeContextSchema>
export type JudgeHallucinations = z.infer<typeof JudgeHallucinationsSchema>

export interface GraphStateAQG {
  request: string
  context: string
  answer?: AQG
}
