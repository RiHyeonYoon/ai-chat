"use client";

import { useState, useCallback } from "react";
import type { Message, Conversation, ChatMessage } from "@/types/chat";

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
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

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      let conversationId = currentConversationId;

      // 첫 메시지면 새 대화 생성
      if (!conversationId) {
        const conversation = await createConversation(content);
        conversationId = conversation.id;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const history: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // 스트리밍 응답을 위한 임시 assistant 메시지
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          conversationId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        },
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
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        }

        // 대화 목록 updatedAt 갱신
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, updatedAt: new Date().toISOString() }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, messages, isLoading, createConversation]
  );

  const resetConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

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
