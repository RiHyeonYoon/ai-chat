# ai-chat 구축 실행계획

## 1단계: 프로젝트 초기 세팅

- [x] Next.js 16 프로젝트 생성 (`npx create-next-app@latest`)
  - TypeScript, Tailwind CSS, App Router 선택
- [x] 의존성 설치
  - [x] `hono` (App Router는 `hono/vercel` 사용, `@hono/node-server` 불필요)
  - [x] `@mastra/core`, `mastra`
  - [x] `@prisma/client`, `prisma`
  - [x] `@anthropic-ai/sdk`
  - [x] `react-markdown`, `remark-gfm` (마크다운 렌더링)
- [x] 환경 변수 설정 (`.env.local`)
  - `ANTHROPIC_API_KEY`
  - `DATABASE_URL`
- [x] `.env.local` `.gitignore`에 추가 (기본 포함 확인)
- [x] `next.config.ts`에 `serverExternalPackages: ['@mastra/*']` 추가

## 2단계: DB 및 ORM 설정

- [x] `prisma/schema.prisma` 작성
  - `Conversation` 모델 정의
  - `Message` 모델 정의
- [x] `npx prisma generate` 실행
- [ ] `npx prisma db push` 로 MongoDB에 스키마 반영 (실제 DB 연결 후 실행)
- [x] `src/lib/prisma.ts` 싱글톤 클라이언트 작성

## 3단계: Mastra 에이전트 설정

- [x] `src/lib/mastra/agent.ts` — Claude 기반 Agent 정의
- [x] `src/lib/mastra/index.ts` — Mastra 인스턴스 초기화
- [ ] 스트리밍 응답(`streamText`) 동작 확인 (4단계 API 구현 후 통합 검증)

## 4단계: API 라우트 구현 (Hono)

- [x] `src/lib/hono/app.ts` — Hono 앱 및 라우트 정의
  - [x] `GET /api/conversations` — 대화 목록 조회
  - [x] `POST /api/conversations` — 새 대화 생성
  - [x] `DELETE /api/conversations/:id` — 대화 삭제
  - [x] `GET /api/conversations/:id/messages` — 메시지 목록 조회
  - [x] `POST /api/chat` — 메시지 전송 + 스트리밍 응답
- [x] `src/app/api/[[...route]]/route.ts` — Next.js에 Hono 마운트

## 5단계: 타입 정의

- [x] `src/types/chat.ts`
  - `Message` 타입
  - `Conversation` 타입

## 6단계: 커스텀 훅 구현

- [x] `src/hooks/useChat.ts`
  - 메시지 전송 및 스트리밍 수신 처리
  - 현재 대화 상태 관리
- [x] 대화 목록 CRUD 로직 포함

## 7단계: UI 컴포넌트 구현

- [x] `Sidebar.tsx` — 대화 히스토리 목록, 새 대화 버튼
- [x] `ChatWindow.tsx` — 메시지 스크롤 목록
- [x] `ChatMessage.tsx` — 사용자/AI 메시지 버블 + 마크다운 렌더링
- [x] `ChatInput.tsx` — 텍스트 입력창, 전송 버튼

## 8단계: 페이지 조립

- [x] `src/app/layout.tsx` — 전체 레이아웃
- [x] `src/app/page.tsx` — Sidebar + ChatWindow + ChatInput 조합

## 9단계: UX 디테일

- [x] 스트리밍 중 로딩 인디케이터 표시 (▍ 커서 애니메이션)
- [x] 새 메시지 수신 시 자동 스크롤
- [x] 새 대화 생성 시 첫 메시지로 제목 자동 설정 (앞 20자)
- [x] 다크/라이트 모드 지원 (Sidebar 토글 버튼 + localStorage 저장)

## 10단계: 검증

- [x] `npm run typecheck` 통과
- [ ] 멀티턴 대화 맥락 유지 동작 확인 (실제 DB/API 키 연결 후 확인 필요)
- [ ] 스트리밍 응답 정상 출력 확인 (실제 DB/API 키 연결 후 확인 필요)
- [ ] 대화 히스토리 저장/불러오기 확인 (실제 DB/API 키 연결 후 확인 필요)
- [ ] 새로고침 후 히스토리 유지 확인 (실제 DB/API 키 연결 후 확인 필요)
- [x] `npm run build` 통과
