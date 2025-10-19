-- 초등 영어 서술형 평가 문항 테이블
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_grade TEXT NOT NULL, -- 단원_및_학년
  example_text TEXT NOT NULL, -- 예시문
  question TEXT NOT NULL, -- 평가문항
  conditions TEXT NOT NULL, -- 조건
  model_answer_1 TEXT NOT NULL, -- 모범_답안_1
  model_answer_2 TEXT NOT NULL, -- 모범_답안_2
  analytical_criteria_1 TEXT NOT NULL, -- 분석적_채점_기준_1
  analytical_criteria_2 TEXT NOT NULL, -- 분석적_채점_기준_2
  analytical_criteria_3 TEXT NOT NULL, -- 분석적_채점_기준_3
  holistic_criteria_a TEXT NOT NULL, -- 총체적_채점_기준_A
  holistic_criteria_b TEXT NOT NULL, -- 총체적_채점_기준_B
  holistic_criteria_c TEXT NOT NULL, -- 총체적_채점_기준_C
  example_answer_a TEXT NOT NULL, -- 성취수준별_예시_답안_A
  example_answer_b TEXT NOT NULL, -- 성취수준별_예시_답안_B
  example_answer_c TEXT NOT NULL, -- 성취수준별_예시_답안_C
  feedback_a TEXT NOT NULL, -- 성취수준별_평가에_따른_예시_피드백_A
  feedback_b TEXT NOT NULL, -- 성취수준별_평가에_따른_예시_피드백_B
  feedback_c TEXT NOT NULL, -- 성취수준별_평가에_따른_예시_피드백_C
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 학생 답안 테이블
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  answer TEXT NOT NULL,
  analytical_score_1 INTEGER, -- 분석적 채점 점수 1 (0-2)
  analytical_score_2 INTEGER, -- 분석적 채점 점수 2 (0-2)
  analytical_score_3 INTEGER, -- 분석적 채점 점수 3 (0-2)
  holistic_score TEXT, -- 총체적 채점 (A, B, C)
  total_score INTEGER, -- 총점 (6점 만점)
  ai_feedback TEXT, -- AI 피드백
  teacher_feedback TEXT, -- 교사 피드백
  -- AAS 전용 필드들
  analytical_reasoning_1 TEXT, -- 과제 수행 채점 근거
  analytical_reasoning_2 TEXT, -- 내용 구성 채점 근거
  analytical_reasoning_3 TEXT, -- 언어 사용 정확성 채점 근거
  evaluation_method TEXT DEFAULT 'standard', -- 평가 방법 (standard, aas)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 평가 세션 테이블 (문항 생성 요청 추적용)
CREATE TABLE IF NOT EXISTS evaluation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request TEXT NOT NULL,
  generated_question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'generated', -- generated, in_use, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 설정
CREATE INDEX IF NOT EXISTS idx_questions_unit_grade ON questions(unit_grade);
CREATE INDEX IF NOT EXISTS idx_student_answers_question_id ON student_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_status ON evaluation_sessions(status);
