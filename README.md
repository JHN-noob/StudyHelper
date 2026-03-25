# Study Helper

모바일 우선으로 만든 공부 기록 서비스입니다.
익명 닉네임으로 바로 진입하고, Supabase anonymous auth 세션을 기반으로 공부 기록을 저장합니다. 저장된 기록은 홈, 기록 목록, 통계, AI 추천 카드에 함께 반영됩니다.

## 주요 기능

- 익명 닉네임 기반 첫 진입 화면
- Supabase anonymous auth 기반 기록 저장
- 공부 기록 추가, 수정, 삭제
- 최근 7일 흐름, 과목별 누적, 오늘 공부 시간 통계
- OpenAI 기반 학습 추천 카드
- 설정 페이지에서 닉네임 변경 및 초기화

## 기술 스택

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase
- OpenAI Responses API

## 화면 구성

- `/`
  홈 대시보드, 최근 기록, 과목별 누적, 추천 카드
- `/add`
  공부 기록 추가 및 수정
- `/records`
  기록 목록, 과목 필터, 삭제
- `/stats`
  최근 7일 통계, 과목별 누적, 추천 카드
- `/settings`
  익명 닉네임 변경, 초기화, AI 사용 안내

## 실행 방법

1. 프로젝트 루트에서 개발 서버를 실행합니다.

```bash
npm run dev
```

2. 브라우저에서 `http://localhost:3000`을 엽니다.

3. 첫 진입 시 익명 닉네임을 입력한 뒤 서비스를 사용합니다.

## 필요한 환경 변수

`.env.local` 또는 배포 환경 변수에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STUDY_RECORDS_TABLE=study_records
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

설명:

- `NEXT_PUBLIC_SUPABASE_URL`
  Supabase 프로젝트 URL입니다.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  브라우저에서 사용하는 Supabase publishable key입니다.
- `NEXT_PUBLIC_STUDY_RECORDS_TABLE`
  선택값입니다. 기본값은 `study_records`입니다.
- `OPENAI_API_KEY`
  AI 추천 기능에 사용하는 서버 환경 변수입니다.
- `OPENAI_MODEL`
  선택값입니다. 기본값은 `gpt-5-mini`입니다.

## Supabase 설정 체크리스트

- Anonymous sign-ins 활성화
- `study_records` 테이블 생성
- RLS 활성화
- `auth.uid() = user_id` 기준으로 `select`, `insert`, `update`, `delete` 정책 설정

권장 컬럼:

- `id`
- `user_id`
- `study_date`
- `subject`
- `duration_minutes`
- `content`
- `created_at`

## 현재 보안 및 운영 동작

- Supabase 연결에 실패하면 더 이상 브라우저 `localStorage`로 조용히 저장하지 않습니다.
- 연결 실패 시 기록 조회, 저장, 수정, 삭제는 막히고 화면에 실패 상태를 보여줍니다.
- OpenAI 추천 API는 운영환경에서 내부 디버그 메시지를 클라이언트로 노출하지 않습니다.

## AI 사용 안내

- 공부 기록의 과목, 날짜, 공부 시간, 메모 내용 일부가 추천 카드 생성을 위해 OpenAI API로 전송될 수 있습니다.
- 민감한 개인정보, 계정 정보, 비밀번호 같은 내용은 공부 메모에 적지 않는 것을 권장합니다.

## 배포 전 점검

- 익명 닉네임 입력
- 익명 세션 생성
- 기록 추가, 수정, 삭제
- 통계 반영
- OpenAI 추천 응답
- Vercel 환경 변수 설정 확인

## 참고

- `.env.local` 값은 저장소에 커밋하지 않습니다.
- 공개 저장소나 문서에 실제 키 값을 적지 않습니다.
