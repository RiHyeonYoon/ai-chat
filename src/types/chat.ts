export type MessageRole = "user" | "assistant";

export type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export interface TextContentBlock {
  type: "text";
  text: string;
}

export interface ImageContentBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: ImageMediaType;
    data: string;
  };
}

export type ContentBlock = TextContentBlock | ImageContentBlock;

// content는 텍스트 전용(string) 또는 멀티모달(JSON 직렬화된 ContentBlock[])
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatMessage = {
  role: MessageRole;
  content: string | ContentBlock[];
};

export interface AttachedImage {
  id: string;
  previewUrl: string;
  base64: string;
  mediaType: ImageMediaType;
}
