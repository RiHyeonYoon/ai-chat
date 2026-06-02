"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "@/types/chat";

interface Props {
  messages: Message[];
  isLoading: boolean;
  hasConversation: boolean;
}

export function ChatWindow({ messages, isLoading, hasConversation }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hasConversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-semibold text-white">무엇을 도와드릴까요?</h1>
        <p className="text-sm text-gray-500">
          아래 입력창에 메시지를 입력하면 새 대화가 시작됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#c96442] text-xs font-bold text-white">
              AI
            </div>
            <div className="rounded-2xl px-4 py-2.5 text-gray-400">
              <span className="animate-pulse">▍</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
