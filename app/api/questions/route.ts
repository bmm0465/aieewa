import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')

    if (questionId) {
      // 특정 문항 조회
      const { data: question, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (error || !question) {
        return NextResponse.json(
          { error: '문항을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      return NextResponse.json({ question })
    } else {
      // 문항 목록 조회
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, unit_grade, question, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('문항 목록 조회 오류:', error)
        return NextResponse.json(
          { error: '문항 목록을 조회할 수 없습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ questions })
    }

  } catch (error) {
    console.error('문항 조회 오류:', error)
    return NextResponse.json(
      { error: '문항을 조회할 수 없습니다.' },
      { status: 500 }
    )
  }
}
