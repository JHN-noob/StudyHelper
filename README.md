# Study Helper

공부 흐름을 기록하고, 오늘의 우선순위를 한 화면에서 정리해보는 모바일 우선 학습 기록 서비스입니다.

## 서비스 주소

- 홈: `https://study-helper-vert.vercel.app/`
- 공부 기록 추가: `https://study-helper-vert.vercel.app/add`

## 현재 화면 기준 핵심 흐름

1. 첫 진입에서 익명 닉네임을 입력합니다.
2. `/add`에서 날짜, 과목, 공부 시간, 메모를 빠르게 기록합니다.
3. 홈에서 오늘 공부 시간, 최근 기록, 과목별 누적, 추천 카드를 확인합니다.
4. `/records`에서 기록을 다시 보고 수정하거나 삭제합니다.
5. `/stats`에서 최근 7일 흐름과 과목별 누적을 확인합니다.
6. `/settings`에서 닉네임을 바꾸거나 초기화합니다.

## 주요 화면

### 홈 `/`

- 오늘 공부 시간
- 최근 7일 흐름
- 최근 기록
- 어떤 과목을 가장 많이 공부했을까?
- AI 추천 영역

### 기록 추가 `/add`

- 이번 공부를 나만의 카드처럼 빠르게 적는 입력 화면
- 최근 기록 미리보기
- 오늘 누적 공부 시간 요약

### 기록 `/records`

- 기록 리스트 보기
- 과목 필터
- 기록 수정
- 기록 삭제

### 통계 `/stats`

- 오늘 총 공부
- 최근 7일 누적
- 평균 세션 길이
- 활성 과목 수
- 기록 기반 추천 카드

### 설정 `/settings`

- 닉네임 변경
- 닉네임 초기화
- AI 사용 안내

## 현재 동작 방식

- 기록 데이터는 Supabase `study_records` 테이블에 저장합니다.
- 인증은 Supabase anonymous auth 기반으로 처리합니다.
- 통계는 저장된 실제 기록을 기준으로 계산합니다.
- AI 추천은 기록이 새로 추가될 때 생성하고, 페이지에 들어올 때마다 반복 호출하지 않습니다.
- Supabase 저장이 실패하면 사용자에게 저장 실패 상태를 보여주고, 조용한 local fallback 저장은 하지 않습니다.
- 운영 환경에서는 내부 디버그 메시지를 사용자 화면에 노출하지 않습니다.

## 기술 스택

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase
- OpenAI Responses API

## 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 됩니다.

## 환경 변수

`.env.local` 또는 배포 환경 변수에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STUDY_RECORDS_TABLE=study_records
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

### 환경 변수 설명

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: 브라우저에서 사용하는 Supabase publishable key
- `NEXT_PUBLIC_STUDY_RECORDS_TABLE`: 기록 테이블 이름. 기본값은 `study_records`
- `OPENAI_API_KEY`: AI 추천 생성에 사용하는 서버 환경 변수
- `OPENAI_MODEL`: 선택값. 기본값은 `gpt-5-mini`

## Supabase 설정 체크

- Anonymous sign-ins 활성화
- `study_records` 테이블 생성
- RLS 활성화
- `auth.uid() = user_id` 기준의 `select`, `insert`, `update`, `delete` 정책 설정

권장 컬럼은 아래와 같습니다.

- `id`
- `user_id`
- `study_date`
- `subject`
- `duration_minutes`
- `content`
- `created_at`

## AI 사용 안내

- 공부 날짜, 과목, 공부 시간, 메모 일부가 추천 카드 생성을 위해 AI API로 전달될 수 있습니다.
- 개인 정보나 민감한 정보는 공부 메모에 적지 않는 것을 권장합니다.

## 배포 전 확인 항목

- 익명 닉네임 입력
- 기록 추가, 수정, 삭제
- 홈 통계 반영
- 통계 페이지 반영
- AI 추천 생성
- Vercel 환경 변수 반영
