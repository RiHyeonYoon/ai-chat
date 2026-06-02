"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";

export default function Home() {
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    loadConversations,
    selectConversation,
    deleteConversation,
    sendMessage,
    resetConversation,
  } = useChat();

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex h-full">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelect={selectConversation}
        onCreate={resetConversation}
        onDelete={deleteConversation}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex flex-1 flex-col overflow-hidden bg-[#212121] light:bg-white">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          hasConversation={currentConversationId !== null}
        />
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}
