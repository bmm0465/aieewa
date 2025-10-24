import { NextRequest, NextResponse } from 'next/server'
import { AQGAgent } from '@/lib/aqg-agent'
import { getServerSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('문항 생성 요청 시작')
    
    const body = await request.json()
    console.log('요청 본문:', body)
    
    const { request: questionRequest, selectedGrade, selectedLesson } = body

    if (!questionRequest) {
      console.error('요청 파라미터 누락:', body)
      return NextResponse.json(
        { error: '요청(request)이 필요합니다.' },
        { status: 400 }
      )
    }

    // 단원 정보가 있으면 요청에 추가 컨텍스트 제공
    let enhancedRequest = questionRequest
    if (selectedGrade && selectedLesson) {
      console.log('단원 정보 추가:', { selectedGrade, selectedLesson })
      enhancedRequest = `${questionRequest}\n\n[단원 정보]\n- 학년: ${selectedGrade}\n- 단원: ${selectedLesson}\n\n이 단원의 학습 목표와 핵심 내용을 고려하여 적절한 난이도의 서술형 평가 문항을 생성해주세요.`
    }

    // 환경 변수 확인
    console.log('환경 변수 확인 중...')
    console.log('OPENAI_API_KEY 존재:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY 길이:', process.env.OPENAI_API_KEY?.length || 0)
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.' },
        { status: 500 }
      )
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Supabase 환경 변수 상태:', {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseKey
    })
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase 환경 변수가 일부 누락되었습니다:', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseKey
      })
    }

    console.log('AQG 에이전트 초기화 시작')
    
    let aqgAgent
    try {
      // AQG 에이전트 실행
      aqgAgent = new AQGAgent()
      console.log('AQG 에이전트 초기화 완료')
    } catch (initError) {
      console.error('AQG 에이전트 초기화 실패:', initError)
      return NextResponse.json(
        { error: `AI 모델 초기화에 실패했습니다: ${initError instanceof Error ? initError.message : '알 수 없는 오류'}` },
        { status: 500 }
      )
    }
    
    console.log('AQG 에이전트 run 메서드 호출')
    
    let result
    try {
      result = await aqgAgent.run(enhancedRequest)
      console.log('AQG 에이전트 실행 완료:', !!result)
    } catch (runError) {
      console.error('AQG 에이전트 실행 실패:', runError)
      
      let errorMessage = 'AI가 문항 생성 중 오류가 발생했습니다.'
      if (runError instanceof Error) {
        errorMessage = runError.message
        
        // 구체적인 에러 메시지 제공
        if (runError.message.includes('API key') || runError.message.includes('인증')) {
          errorMessage = 'AI 서비스 인증에 문제가 있습니다.'
        } else if (runError.message.includes('rate limit') || runError.message.includes('사용량')) {
          errorMessage = 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        } else if (runError.message.includes('network') || runError.message.includes('네트워크')) {
          errorMessage = 'AI 서비스 연결에 문제가 있습니다.'
        } else if (runError.message.includes('파싱') || runError.message.includes('parsing')) {
          errorMessage = 'AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    if (!result) {
      console.error('AQG 에이전트가 빈 결과를 반환했습니다.')
      return NextResponse.json(
        { error: 'AI가 문항을 생성하지 못했습니다.' },
        { status: 500 }
      )
    }

    // 필요한 필드가 있는지 확인
    const requiredFields = ['단원_및_학년', '예시문', '평가문항', '조건'] as const
    const missingFields = requiredFields.filter(field => !result[field as keyof typeof result])
    
    if (missingFields.length > 0) {
      console.error('필수 필드 누락:', missingFields, result)
      return NextResponse.json(
        { error: `생성된 문항에 필수 정보가 누락되었습니다: ${missingFields.join(', ')}` },
        { status: 500 }
      )
    }

    console.log('데이터베이스 저장 시작')
    
    try {
      // Supabase 환경 변수 다시 확인 (이전에 체크했지만 안전성을 위해)
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase 환경 변수가 누락되어 데이터베이스 저장을 건너뜁니다.')
        return NextResponse.json({
          success: true,
          question: result,
          questionId: null,
          warning: '문항은 생성되었지만 데이터베이스 설정이 누락되어 저장되지 않았습니다.'
        })
      }

      // 데이터베이스에 저장
      const supabase = getServerSupabaseClient()
      console.log('Supabase 클라이언트 생성 완료')
      
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          unit_grade: result.단원_및_학년,
          example_text: result.예시문,
          question: result.평가문항,
          conditions: result.조건,
          model_answer_1: result.모범_답안_1 || '',
          model_answer_2: result.모범_답안_2 || '',
          analytical_criteria_1: result.분석적_채점_기준_1 || '',
          analytical_criteria_2: result.분석적_채점_기준_2 || '',
          analytical_criteria_3: result.분석적_채점_기준_3 || '',
          holistic_criteria_a: result.총체적_채점_기준_A || '',
          holistic_criteria_b: result.총체적_채점_기준_B || '',
          holistic_criteria_c: result.총체적_채점_기준_C || '',
          example_answer_a: result.성취수준별_예시_답안_A || '',
          example_answer_b: result.성취수준별_예시_답안_B || '',
          example_answer_c: result.성취수준별_예시_답안_C || '',
          feedback_a: result.성취수준별_평가에_따른_예시_피드백_A || '',
          feedback_b: result.성취수준별_평가에_따른_예시_피드백_B || '',
          feedback_c: result.성취수준별_평가에_따른_예시_피드백_C || '',
        })
        .select()
        .single()

      if (questionError) {
        console.error('문항 저장 오류:', questionError)
        return NextResponse.json(
          { error: `문항 저장에 실패했습니다: ${questionError.message}` },
          { status: 500 }
        )
      }

      console.log('문항 저장 성공:', questionData)

      // 평가 세션 저장 (실패해도 무시)
      try {
        await supabase
          .from('evaluation_sessions')
          .insert({
            request: questionRequest,
            generated_question_id: questionData.id,
            status: 'generated'
          })
        console.log('평가 세션 저장 완료')
      } catch (sessionError) {
        console.warn('평가 세션 저장 실패 (무시됨):', sessionError)
      }

      return NextResponse.json({
        success: true,
        question: result,
        questionId: questionData.id
      })
      
    } catch (dbError) {
      console.error('데이터베이스 연동 오류:', dbError)
      // 데이터베이스 저장이 실패해도 결과는 반환
      return NextResponse.json({
        success: true,
        question: result,
        questionId: null,
        warning: '문항은 생성되었지만 데이터베이스 저장에 실패했습니다.'
      })
    }

  } catch (error) {
    console.error('문항 생성 전체 오류:', error)
    
    let errorMessage = '문항 생성에 실패했습니다.'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // 구체적인 에러 타입별 메시지
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API 키 설정에 문제가 있습니다.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '네트워크 연결에 문제가 있습니다.'
      } else if (error.message.includes('timeout')) {
        errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
