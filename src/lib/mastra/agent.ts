import { Agent } from "@mastra/core/agent";

export const chatAgent = new Agent({
  id: "chat-agent",
  name: "Chat Agent",
  instructions: `당신은 친절하고 유능한 AI 어시스턴트입니다.
한국어로만 응답하세요.
마크다운 형식을 활용해 코드, 목록, 강조 등을 명확하게 표현하세요.`,
  model: "anthropic/claude-sonnet-4-6",
});
