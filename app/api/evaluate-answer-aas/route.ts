import { NextRequest, NextResponse } from 'next/server'
import { AASAgent } from '@/lib/aas-agent'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { questionId, studentName, answer } = await request.json()

    if (!questionId || !studentName || !answer) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 문항 정보 조회
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: '문항을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // AAS 에이전트를 위한 요청 구성
    const aasRequest = `${question.unit_grade} 평가 문항과 채점 기준을 바탕으로 ${studentName} 학생의 답안: "${answer}"를 채점하고 피드백을 생성해줘.`

    // AAS 에이전트 실행
    const aasAgent = new AASAgent()
    const aasResult = await aasAgent.run(aasRequest)

    // 결과를 기존 EvaluationResult 형식으로 변환
    const evaluationResult = {
      analytical_score_1: aasResult.과제_수행,
      analytical_score_2: aasResult.내용_구성,
      analytical_score_3: aasResult.언어_사용_정확성,
      holistic_score: aasResult.총체적_채점.includes('A') ? 'A' : 
                     aasResult.총체적_채점.includes('B') ? 'B' : 'C',
      total_score: aasResult.총점,
      ai_feedback: aasResult.피드백,
      // AAS 전용 추가 정보
      analytical_reasoning_1: aasResult.과제_수행_채점_근거,
      analytical_reasoning_2: aasResult.내용_구성_채점_근거,
      analytical_reasoning_3: aasResult.언어_사용_정확성_채점_근거,
    }

    // 학생 답안 데이터베이스에 저장
    const { data: answerData, error: answerError } = await supabase
      .from('student_answers')
      .insert({
        question_id: questionId,
        student_name: studentName,
        answer: answer,
        analytical_score_1: evaluationResult.analytical_score_1,
        analytical_score_2: evaluationResult.analytical_score_2,
        analytical_score_3: evaluationResult.analytical_score_3,
        holistic_score: evaluationResult.holistic_score,
        total_score: evaluationResult.total_score,
        ai_feedback: evaluationResult.ai_feedback,
        analytical_reasoning_1: evaluationResult.analytical_reasoning_1,
        analytical_reasoning_2: evaluationResult.analytical_reasoning_2,
        analytical_reasoning_3: evaluationResult.analytical_reasoning_3,
        evaluation_method: 'aas',
      })
      .select()
      .single()

    if (answerError) {
      console.error('답안 저장 오류:', answerError)
      return NextResponse.json(
        { error: '답안 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      evaluation: evaluationResult,
      aasResult: aasResult, // 전체 AAS 결과도 포함
      answerId: answerData.id
    })

  } catch (error) {
    console.error('AAS 답안 평가 오류:', error)
    return NextResponse.json(
      { error: '답안 평가에 실패했습니다.' },
      { status: 500 }
    )
  }
}
