import { NextRequest, NextResponse } from 'next/server'
import { AQGAgent } from '@/lib/aqg-agent'
import { getServerSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { request: questionRequest } = await request.json()

    if (!questionRequest) {
      return NextResponse.json(
        { error: '요청(request)이 필요합니다.' },
        { status: 400 }
      )
    }

    // AQG 에이전트 실행
    const aqgAgent = new AQGAgent()
    const result = await aqgAgent.run(questionRequest)

    // 데이터베이스에 저장
    const supabase = getServerSupabaseClient()
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        unit_grade: result.단원_및_학년,
        example_text: result.예시문,
        question: result.평가문항,
        conditions: result.조건,
        model_answer_1: result.모범_답안_1,
        model_answer_2: result.모범_답안_2,
        analytical_criteria_1: result.분석적_채점_기준_1,
        analytical_criteria_2: result.분석적_채점_기준_2,
        analytical_criteria_3: result.분석적_채점_기준_3,
        holistic_criteria_a: result.총체적_채점_기준_A,
        holistic_criteria_b: result.총체적_채점_기준_B,
        holistic_criteria_c: result.총체적_채점_기준_C,
        example_answer_a: result.성취수준별_예시_답안_A,
        example_answer_b: result.성취수준별_예시_답안_B,
        example_answer_c: result.성취수준별_예시_답안_C,
        feedback_a: result.성취수준별_평가에_따른_예시_피드백_A,
        feedback_b: result.성취수준별_평가에_따른_예시_피드백_B,
        feedback_c: result.성취수준별_평가에_따른_예시_피드백_C,
      })
      .select()
      .single()

    if (questionError) {
      console.error('문항 저장 오류:', questionError)
      return NextResponse.json(
        { error: '문항 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 평가 세션 저장
    await supabase
      .from('evaluation_sessions')
      .insert({
        request: questionRequest,
        generated_question_id: questionData.id,
        status: 'generated'
      })

    return NextResponse.json({
      success: true,
      question: result,
      questionId: questionData.id
    })

  } catch (error) {
    console.error('문항 생성 오류:', error)
    return NextResponse.json(
      { error: '문항 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
