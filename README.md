# AIEEWA - 초등 영어 서술형 평가 시스템

LLM(GPT-4o)과 RAG, Self-RAG, LLM-as-a-Judge를 활용한 초등 영어 서술형 평가 문항 생성 및 자동 채점 시스템입니다.

## 🚀 주요 기능

### 📝 문항 생성 (AQG - Automated Question Generation)
- **RAG 기반**: 검색 증강 생성을 통한 교육과정 부합 문항 생성
- **Self-RAG**: 문항 품질 자동 검증 및 개선
- **종합적 채점 기준**: 분석적/총체적 채점 기준 및 성취수준별 피드백

### 📊 답안 평가
- **LLM-as-a-Judge**: 일관성 있는 객관적 채점
- **분석적 평가**: 3개 영역별 세밀한 평가 (과제수행, 구성, 언어사용)
- **맞춤형 피드백**: 성취수준별 개별화된 피드백 제공

### 🤖 AAS (Automated Answer Scoring)
- **Few-shot 학습**: 교사 채점 예시를 활용한 정확한 채점
- **Self-RAG 품질 검증**: 채점 정확성과 피드백 품질 자동 검증
- **상세한 채점 근거**: 각 항목별 채점 근거를 명확히 제시
- **교육적 피드백**: 초등학생 수준에 맞는 구체적인 개선 제안

## 🛠 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: 
  - OpenAI GPT-4o
  - LangChain
  - LangGraph
  - HuggingFace Embeddings

## 📋 설치 및 실행

### 1. 환경 설정

\`\`\`bash
# 의존성 설치
npm install
\`\`\`

### 2. 환경 변수 설정

\`env.example\` 파일을 참고하여 \`.env.local\` 파일을 생성하고 다음 값들을 설정하세요:

\`\`\`env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# LangChain 설정
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=AIEEWA
LANGCHAIN_API_KEY=your_langchain_api_key_here

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
\`\`\`

### 3. 데이터베이스 설정

Supabase 프로젝트에서 \`lib/database.sql\` 파일의 SQL 스크립트를 실행하여 필요한 테이블들을 생성하세요.

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 웹페이지를 확인하세요.

## 📁 프로젝트 구조

\`\`\`
├── app/
│   ├── api/
│   │   ├── generate-question/    # 문항 생성 API
│   │   ├── evaluate-answer/      # 답안 평가 API (표준)
│   │   ├── evaluate-answer-aas/  # 답안 평가 API (AAS)
│   │   └── questions/            # 문항 조회 API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                       # UI 컴포넌트
│   ├── QuestionGenerator.tsx     # 문항 생성 컴포넌트
│   └── AnswerEvaluator.tsx       # 답안 평가 컴포넌트
├── lib/
│   ├── aqg-agent.ts              # AQG 에이전트
│   ├── aas-agent.ts              # AAS 에이전트
│   ├── evaluation-agent.ts       # 평가 에이전트
│   ├── supabase.ts              # Supabase 클라이언트
│   ├── database.sql             # 데이터베이스 스키마
│   └── types/
│       ├── aqg.ts               # AQG 타입 정의
│       └── aas.ts               # AAS 타입 정의
└── ...
\`\`\`

## 🚀 Vercel 배포

1. GitHub 저장소에 코드를 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정
4. Supabase 프로젝트 연결

## 🔧 주요 컴포넌트

### AQG 에이전트 (\`lib/aqg-agent.ts\`)
- RAG 기반 문서 검색
- Self-RAG를 통한 품질 검증
- 요청 재작성 및 재시도 로직

### 평가 에이전트 (\`lib/evaluation-agent.ts\`)
- LLM-as-a-Judge 기반 채점
- 분석적/총체적 평가
- 맞춤형 피드백 생성

### AAS 에이전트 (\`lib/aas-agent.ts\`)
- Few-shot 학습을 통한 정확한 채점
- Self-RAG를 활용한 채점 정확성 검증
- 상세한 채점 근거 및 교육적 피드백 생성

## 📊 데이터베이스 스키마

- \`questions\`: 생성된 평가 문항 저장
- \`student_answers\`: 학생 답안 및 평가 결과
- \`evaluation_sessions\`: 평가 세션 관리

## 🤝 기여

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
