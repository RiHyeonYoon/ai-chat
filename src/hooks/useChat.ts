"use client";

import { useState, useCallback } from "react";
import type { Message, Conversation, ChatMessage, AttachedImage, ContentBlock } from "@/types/chat";

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data: Conversation[] = await res.json();
    setConversations(data);
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setCurrentConversationId(id);
    const res = await fetch(`/api/conversations/${id}/messages`);
    const data: Message[] = await res.json();
    setMessages(data);
  }, []);

  const createConversation = useCallback(async (title: string) => {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data: Conversation = await res.json();
    setConversations((prev) => [data, ...prev]);
    setCurrentConversationId(data.id);
    setMessages([]);
    return data;
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    },
    [currentConversationId]
  );

  const resetConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string, images: AttachedImage[] = []) => {
      if ((!text.trim() && images.length === 0) || isLoading) return;

      let conversationId = currentConversationId;
      const title = text.trim() || "이미지 대화";

      if (!conversationId) {
        const conversation = await createConversation(title);
        conversationId = conversation.id;
      }

      // 멀티모달 content 블록 구성
      const contentBlocks: ContentBlock[] = [
        ...images.map((img) => ({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: img.mediaType,
            data: img.base64,
          },
        })),
        ...(text.trim() ? [{ type: "text" as const, text: text.trim() }] : []),
      ];

      // 단일 텍스트면 string, 이미지 포함이면 JSON 직렬화
      const userContent =
        images.length === 0 ? text.trim() : JSON.stringify(contentBlocks);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        role: "user",
        content: userContent,
        createdAt: new Date().toISOString(),
      };

      // API에 전달할 히스토리 (멀티모달 포함)
      const history: ChatMessage[] = [
        ...messages.map((m) => {
          if (m.content.startsWith("[")) {
            try { return { role: m.role, content: JSON.parse(m.content) }; }
            catch { /* fallthrough */ }
          }
          return { role: m.role, content: m.content };
        }),
        { role: "user", content: images.length === 0 ? text.trim() : contentBlocks },
      ];

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, conversationId, role: "assistant", content: "", createdAt: new Date().toISOString() },
      ]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, messages: history }),
        });

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, updatedAt: new Date().toISOString() } : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, messages, isLoading, createConversation]
  );

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    resetConversation,
  };
}
