import { Hono } from "hono";
import { stream } from "hono/streaming";
import { prisma } from "@/lib/prisma";
import { mastra } from "@/lib/mastra";
import type { ChatMessage } from "@/types/chat";

const app = new Hono().basePath("/api");

// GET /api/conversations — 대화 목록 조회
app.get("/conversations", async (c) => {
  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return c.json(conversations);
});

// POST /api/conversations — 새 대화 생성
app.post("/conversations", async (c) => {
  const { title } = await c.req.json<{ title: string }>();
  const conversation = await prisma.conversation.create({
    data: { title: title.slice(0, 20) },
  });
  return c.json(conversation, 201);
});

// DELETE /api/conversations/:id — 대화 삭제
app.delete("/conversations/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.conversation.delete({ where: { id } });
  return c.json({ success: true });
});

// GET /api/conversations/:id/messages — 메시지 목록 조회
app.get("/conversations/:id/messages", async (c) => {
  const id = c.req.param("id");
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });
  return c.json(messages);
});

// POST /api/chat — 메시지 전송 + 스트리밍 응답
app.post("/chat", async (c) => {
  const { conversationId, messages } = await c.req.json<{
    conversationId: string;
    messages: ChatMessage[];
  }>();

  const lastUserMessage = messages[messages.length - 1];

  // content가 배열(멀티모달)이면 JSON 직렬화해서 저장
  const contentToStore =
    typeof lastUserMessage.content === "string"
      ? lastUserMessage.content
      : JSON.stringify(lastUserMessage.content);

  await prisma.message.create({
    data: {
      conversationId,
      role: lastUserMessage.role,
      content: contentToStore,
    },
  });

  const agent = mastra.getAgent("chatAgent");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentStream = await agent.stream(messages as any);

  let fullText = "";

  return stream(c, async (s) => {
    for await (const chunk of agentStream.textStream) {
      fullText += chunk;
      await s.write(chunk);
    }

    // 완료 후 어시스턴트 메시지 저장
    await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: fullText,
      },
    });

    // 대화 updatedAt 갱신
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  });
});

export default app;
