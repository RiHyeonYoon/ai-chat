# ai-chat

Claude API + Mastra 에이전트 프레임워크 기반 AI 챗봇 웹 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)

## 기술 스택

| 역할 | 기술 |
|------|------|
| UI | Next.js 16 (App Router) + TypeScript |
| API 라우터 | Hono (`hono/vercel`) |
| AI 에이전트 | Mastra + Claude (claude-sonnet-4-6) |
| ORM | Prisma 6 |
| DB | MongoDB |
| 스타일링 | Tailwind CSS 4 |

## 기능

- **멀티턴 대화** — 이전 맥락을 유지하며 대화
- **스트리밍 응답** — AI 답변이 실시간으로 타이핑되듯 출력
- **마크다운 렌더링** — 코드 블록, 볼드, 목록 등 렌더링
- **대화 히스토리** — MongoDB에 저장, 새로고침 후에도 유지
- **다크/라이트 모드** — 토글 버튼으로 전환, 설정 저장
- **한국어 전용 UI**

## 시작하기

### 사전 요구 사항

- Node.js 20+
- MongoDB (Atlas 또는 로컬)
- Anthropic API 키

### 설치

```bash
git clone https://github.com/RiHyeonYoon/ai-chat.git
cd ai-chat
npm install
```

### 환경 변수

`.env.local` 파일을 생성하고 아래 값을 입력하세요.

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ai-chat
```

### DB 스키마 반영

```bash
npx prisma db push
```

### 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인하세요.

## API 라우트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/conversations` | 대화 목록 조회 |
| POST | `/api/conversations` | 새 대화 생성 |
| DELETE | `/api/conversations/:id` | 대화 삭제 |
| GET | `/api/conversations/:id/messages` | 메시지 목록 조회 |
| POST | `/api/chat` | 메시지 전송 + 스트리밍 응답 |

## 프로젝트 구조

```
src/
├── app/
│   ├── api/[[...route]]/route.ts  # Hono 마운트
│   ├── page.tsx                   # 메인 페이지
│   └── layout.tsx
├── components/
│   ├── Sidebar.tsx                # 대화 목록 + 테마 토글
│   ├── ChatWindow.tsx             # 메시지 스크롤 영역
│   ├── ChatMessage.tsx            # 메시지 버블 + 마크다운
│   └── ChatInput.tsx              # 입력창
├── hooks/
│   ├── useChat.ts                 # 채팅 상태 + API 호출
│   └── useTheme.ts                # 다크/라이트 모드
├── lib/
│   ├── mastra/                    # Mastra Agent 설정
│   ├── hono/                      # Hono 라우트 정의
│   └── prisma.ts                  # Prisma 싱글톤
└── types/
    └── chat.ts                    # 공유 타입 정의
```

## 라이선스

MIT
