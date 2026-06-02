"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 내용에 따라 textarea 높이 자동 조정
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/10 px-4 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-end gap-3 rounded-2xl bg-[#2f2f2f] px-4 py-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-black transition-opacity disabled:opacity-30"
            aria-label="전송"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-600">
          AI는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.
        </p>
      </div>
    </div>
  );
}
