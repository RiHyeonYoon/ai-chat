"use client";

import type { Conversation } from "@/types/chat";

interface Props {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelect,
  onCreate,
  onDelete,
  theme,
  onToggleTheme,
}: Props) {
  return (
    <aside className="flex h-full w-64 flex-col bg-[#1a1a1a] text-sm light:bg-gray-100">
      <div className="flex items-center gap-1 p-3">
        <button
          onClick={onCreate}
          className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 light:text-gray-700 light:hover:bg-black/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          새 대화
        </button>
        <button
          onClick={onToggleTheme}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 light:text-gray-600 light:hover:bg-black/10"
          aria-label="테마 전환"
        >
          {theme === "dark" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-gray-500">대화 없음</p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id} className="group relative">
                <button
                  onClick={() => onSelect(c.id)}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left transition-colors ${
                    currentConversationId === c.id
                      ? "bg-white/15 text-white"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {c.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                  aria-label="대화 삭제"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
