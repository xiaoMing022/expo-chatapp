// types.ts
export type MessageType = "thinking" | "plan" | "draft" | "final" | "image";

export interface Message {
  id: string;
  role: "user" | "assistant";
  type: MessageType;
  content: string;
}

export interface PendingFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export type Theme = "light" | "dark";