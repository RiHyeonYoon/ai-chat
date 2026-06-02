"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message, ContentBlock } from "@/types/chat";

interface Props {
  message: Message;
}

function parseContent(content: string): ContentBlock[] | null {
  if (!content.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as ContentBlock[];
    return null;
  } catch {
    return null;
  }
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const blocks = parseContent(message.content);

  const renderContent = () => {
    if (blocks) {
      return (
        <div className="space-y-2">
          {blocks.map((block, i) => {
            if (block.type === "image") {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={`data:${block.source.media_type};base64,${block.source.data}`}
                  alt="첨부 이미지"
                  className="max-h-80 max-w-full rounded-lg object-contain"
                />
              );
            }
            if (block.type === "text" && block.text) {
              return isUser ? (
                <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                  {block.text}
                </p>
              ) : (
                <div key={i} className="prose prose-invert prose-sm max-w-none leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return isUser ? (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {message.content || "▍"}
      </p>
    ) : (
      <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content || "▍"}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#c96442] text-xs font-bold text-white">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isUser ? "bg-[#2f2f2f] text-white light:bg-gray-200 light:text-gray-900" : "bg-transparent text-gray-100 light:text-gray-800"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
