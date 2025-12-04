// types.ts
export type MessageType = "thinking" | "plan" | "draft" | "final" | "image";

export interface Message {
  id: string;
  role: "user" | "assistant";
  type: MessageType;
  content: string;
  images?: string[]; // 本地 base64 地址
  files?: PendingFile[]; // 本地待上传文件
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}


export interface PendingFile {
  uri: string;
  name: string; // 文件名
  mimeType: string; // MIME 类型
  size: number;
}

export interface ChatInputProps {
  input: string;
  setInput: (text: string) => void;
  pendingImages: string[];
  setPendingImages: (uris: string[]) => void;
  // ⭐ 新增: 待发送的文件列表
  pendingFiles: PendingFile[];
  setPendingFiles: (files: PendingFile[]) => void;
  onSend: () => void;
  // ⭐ 修改: onUpload 现在可以处理图片或文件选择
  onUpload: () => void; 
  theme: "dark" | "light";
  streaming: boolean;
}

export type Theme = "light" | "dark";