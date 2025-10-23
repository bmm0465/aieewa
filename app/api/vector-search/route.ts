import { NextRequest, NextResponse } from 'next/server'
import { generateSingleEmbedding, searchSimilarVectors } from '@/lib/embeddings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 벡터 검색 API
export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, threshold = 0.7 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: '검색 쿼리가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('벡터 검색 요청:', { query, limit, threshold })

    // 쿼리 임베딩 생성
    const queryEmbedding = await generateSingleEmbedding(query)
    
    // 벡터 유사도 검색
    const results = await searchSimilarVectors(queryEmbedding, limit, threshold)

    return NextResponse.json({
      success: true,
      query,
      results: results.map(result => ({
        text: result.chunk_text,
        metadata: result.metadata,
        similarity: result.similarity
      })),
      totalResults: results.length
    })

  } catch (error) {
    console.error('벡터 검색 오류:', error)
    return NextResponse.json(
      { error: `벡터 검색에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}

// 벡터 검색 상태 확인
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '벡터 검색 API가 정상적으로 작동합니다.',
      features: [
        '의미적 유사도 검색',
        '코사인 유사도 기반 랭킹',
        '임계값 필터링',
        '메타데이터 포함'
      ]
    })
  } catch (error) {
    console.error('벡터 검색 상태 확인 오류:', error)
    return NextResponse.json(
      { error: '벡터 검색 상태를 확인할 수 없습니다.' },
      { status: 500 }
    )
  }
}
