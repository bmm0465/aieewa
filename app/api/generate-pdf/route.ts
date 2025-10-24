import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { questionId } = await request.json()

    if (!questionId) {
      return NextResponse.json(
        { error: '문항 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 문항 정보 조회
    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (error || !question) {
      console.error('문항 조회 오류:', error)
      return NextResponse.json(
        { error: '문항을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // PDF HTML 템플릿 생성
    const pdfHtml = generateQuestionPDF(question)

    return NextResponse.json({
      success: true,
      html: pdfHtml,
      questionId: question.id
    })

  } catch (error) {
    console.error('PDF 생성 오류:', error)
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

function generateQuestionPDF(question: any): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>초등 영어 서술형 평가 문항</title>
    <style>
        body {
            font-family: 'Malgun Gothic', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #fff;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .header h2 {
            color: #64748b;
            margin: 5px 0 0 0;
            font-size: 16px;
            font-weight: normal;
        }
        .question-section {
            margin-bottom: 30px;
        }
        .section-title {
            background-color: #f1f5f9;
            padding: 10px 15px;
            border-left: 4px solid #2563eb;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1e293b;
        }
        .content {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            white-space: pre-wrap;
        }
        .criteria-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .criteria-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
        }
        .criteria-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 10px;
        }
        .example-answer {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        .example-title {
            font-weight: bold;
            color: #065f46;
            margin-bottom: 10px;
        }
        .feedback-section {
            background-color: #fef2f2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        .feedback-title {
            font-weight: bold;
            color: #991b1b;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
            .question-section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>초등 영어 서술형 평가 문항</h1>
        <h2>${question.unit_grade}</h2>
    </div>

    <div class="question-section">
        <div class="section-title">📝 예시문</div>
        <div class="content">${question.example_text}</div>
    </div>

    <div class="question-section">
        <div class="section-title">❓ 평가 문항</div>
        <div class="content">${question.question}</div>
    </div>

    <div class="question-section">
        <div class="section-title">📋 조건</div>
        <div class="content">${question.conditions}</div>
    </div>

    <div class="question-section">
        <div class="section-title">✅ 모범 답안</div>
        <div class="content">
            <strong>모범 답안 1:</strong><br>
            ${question.model_answer_1}<br><br>
            <strong>모범 답안 2:</strong><br>
            ${question.model_answer_2}
        </div>
    </div>

    <div class="criteria-section">
        <div class="criteria-box">
            <div class="criteria-title">📊 분석적 채점 기준</div>
            <div class="content">
                <strong>1. ${question.analytical_criteria_1}</strong><br><br>
                <strong>2. ${question.analytical_criteria_2}</strong><br><br>
                <strong>3. ${question.analytical_criteria_3}</strong>
            </div>
        </div>

        <div class="criteria-box">
            <div class="criteria-title">🎯 총체적 채점 기준</div>
            <div class="content">
                <strong>A 수준:</strong><br>
                ${question.holistic_criteria_a}<br><br>
                <strong>B 수준:</strong><br>
                ${question.holistic_criteria_b}<br><br>
                <strong>C 수준:</strong><br>
                ${question.holistic_criteria_c}
            </div>
        </div>
    </div>

    <div class="question-section">
        <div class="section-title">📚 성취수준별 예시 답안</div>
        
        <div class="example-answer">
            <div class="example-title">A 수준 답안</div>
            <div class="content">${question.example_answer_a}</div>
        </div>

        <div class="example-answer">
            <div class="example-title">B 수준 답안</div>
            <div class="content">${question.example_answer_b}</div>
        </div>

        <div class="example-answer">
            <div class="example-title">C 수준 답안</div>
            <div class="content">${question.example_answer_c}</div>
        </div>
    </div>

    <div class="feedback-section">
        <div class="feedback-title">💬 성취수준별 피드백</div>
        <div class="content">
            <strong>A 수준 피드백:</strong><br>
            ${question.feedback_a}<br><br>
            <strong>B 수준 피드백:</strong><br>
            ${question.feedback_b}<br><br>
            <strong>C 수준 피드백:</strong><br>
            ${question.feedback_c}
        </div>
    </div>

    <div class="footer">
        <p>생성일: ${new Date(question.created_at).toLocaleDateString('ko-KR')}</p>
        <p>AI 기반 초등 영어 서술형 평가 문항 생성 시스템</p>
    </div>
</body>
</html>
  `
}
