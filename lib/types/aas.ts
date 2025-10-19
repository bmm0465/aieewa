import { z } from 'zod'

// AAS 스키마 정의 (Pydantic에서 Zod로 변환)
export const AASSchema = z.object({
  이름: z.string().describe("학생의 이름"),
  답안: z.string().describe("학생의 서술형 답안"),
  과제_수행: z.number().min(0).max(2).describe("분석적 채점 기준인 과제 수행에서 답안에 부여한 0~2점 사이의 점수"),
  과제_수행_채점_근거: z.string().describe("과제 수행 채점에 대한 근거"),
  내용_구성: z.number().min(0).max(2).describe("분석적 채점 기준인 내용 구성에서 답안에 부여한 0~2점 사이의 점수"),
  내용_구성_채점_근거: z.string().describe("내용 구성 채점에 대한 근거"),
  언어_사용_정확성: z.number().min(0).max(2).describe("분석적 채점 기준인 언어 사용 정확성에서 답안에 부여한 0~2점 사이의 점수"),
  언어_사용_정확성_채점_근거: z.string().describe("언어 사용 정확성 채점에 대한 근거"),
  총점: z.number().describe("분석적 채점 기준 점수를 모두 더한 점수"),
  총체적_채점: z.string().describe("총체적 채점 기준에 기반한 채점 결과"),
  피드백: z.string().describe("채점 결과에 따른 학생에게 제공할 피드백")
})

export type AAS = z.infer<typeof AASSchema>

export const JudgeHallucinationsAASSchema = z.object({
  score: z.number().min(1).max(4).describe("1~4")
})

export const JudgeFeedbackAASSchema = z.object({
  score: z.number().min(1).max(4).describe("1~4")
})

export type JudgeHallucinationsAAS = z.infer<typeof JudgeHallucinationsAASSchema>
export type JudgeFeedbackAAS = z.infer<typeof JudgeFeedbackAASSchema>

export interface GraphStateAAS {
  request: string
  criteria: string
  answer?: AAS
}
