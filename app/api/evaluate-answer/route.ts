import { NextRequest, NextResponse } from 'next/server'
import { EvaluationAgent } from '@/lib/evaluation-agent'
import { getServerSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

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
    const supabase = getServerSupabaseClient()
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

    // AI 평가 실행
    const evaluationAgent = new EvaluationAgent()
    const evaluationResult = await evaluationAgent.evaluateAnswer(
      question,
      answer,
      studentName
    )

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
      answerId: answerData.id
    })

  } catch (error) {
    console.error('답안 평가 오류:', error)
    return NextResponse.json(
      { error: '답안 평가에 실패했습니다.' },
      { status: 500 }
    )
  }
}
