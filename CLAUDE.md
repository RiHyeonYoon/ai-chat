@AGENTS.md

# ai-chat

Claude API + Mastra 에이전트 프레임워크를 사용하는 AI 챗봇 웹 애플리케이션.

## 기술 스택

| 역할 | 기술 |
|------|------|
| UI | Next.js 16 (App Router) + TypeScript |
| API 라우터 | Hono (`hono/vercel` 어댑터) |
| AI 에이전트 | Mastra |
| AI 모델 | Anthropic Claude (claude-sonnet-4-6) |
| ORM | Prisma (MongoDB provider) |
| DB | MongoDB |
| 스타일링 | Tailwind CSS |

## 핵심 기능

- 멀티턴 대화 (Mastra Agent Memory로 맥락 유지)
- 스트리밍 응답 (실시간 타이핑 효과)
- 마크다운 렌더링 (코드블록, 볼드 등)
- 대화 히스토리 저장/조회 (MongoDB)
- 한국어 전용 UI

## 지원하지 않는 기능

- 사용자 인증/로그인
- 이미지 인식
- 음성 입력

## 프로젝트 구조

```
src/
  app/
    page.tsx                        # 메인 채팅 페이지
    layout.tsx
    api/
      [[...route]]/
        route.ts                    # Hono 마운트 포인트
  components/
    ChatInput.tsx                   # 메시지 입력창
    ChatMessage.tsx                 # 메시지 (마크다운 렌더링)
    ChatWindow.tsx                  # 대화 목록
    Sidebar.tsx                     # 대화 히스토리 목록
  hooks/
    useChat.ts                      # 채팅 상태 관리 + API 호출
  lib/
    mastra/
      agent.ts                      # Mastra Agent 정의
      index.ts                      # Mastra 인스턴스
    hono/
      app.ts                        # Hono 앱 및 라우트 정의
    prisma.ts                       # Prisma 클라이언트 싱글톤
  types/
    chat.ts                         # Message, Conversation 타입
prisma/
  schema.prisma
```

## Prisma 스키마

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Conversation {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" | "assistant"
  content        String
  createdAt      DateTime     @default(now())
}
```

## API 라우트 (Hono)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/conversations` | 대화 목록 조회 |
| POST | `/api/conversations` | 새 대화 생성 |
| DELETE | `/api/conversations/:id` | 대화 삭제 |
| GET | `/api/conversations/:id/messages` | 특정 대화의 메시지 목록 |
| POST | `/api/chat` | 메시지 전송 + 스트리밍 응답 |

## 환경 변수

```
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=mongodb+srv://...
```

## 개발 명령어

```bash
npm install
npm run dev
npx prisma generate
npx prisma db push
npm run build
npm run typecheck   # tsc --noEmit
```

## 구현 시 주의사항

- Hono는 `src/app/api/[[...route]]/route.ts`에서 `hono/vercel`의 `handle()` 사용
- Mastra Agent는 `streamText()`로 스트리밍 응답 처리
- Prisma 클라이언트는 싱글톤 패턴으로 관리 (hot reload 시 중복 인스턴스 방지)
- 새 대화 생성 시 첫 메시지 내용으로 자동 title 생성 (앞 20자)
- 스트리밍 응답은 `text/event-stream` Content-Type 사용
- `next.config.ts`에 `serverExternalPackages: ['@mastra/*']` 필수
