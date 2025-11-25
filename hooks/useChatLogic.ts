import { useState } from "react";
import { useImagePicker } from "./useImagePicker";

export function useChatLogic() {
  const [conversations, setConversations] = useState([
    {
      id: "c1",
      title: "示例会话1",
      messages: [{ id: "m1", role: "assistant", type: "final", content: "欢迎使用 AI 助手！" }],
      updatedAt: Date.now(),
    },
  ]);
  const [activeConvId, setActiveConvId] = useState(conversations[0].id);
  const [messages, setMessages] = useState(conversations[0].messages);
  const [streaming, setStreaming] = useState(false);

  const { pickImage } = useImagePicker();

  const pushMessage = (msg: any) => {
    setMessages((prev) => {
      const newMsgs = [...prev, msg];
      setConversations((convs) =>
        convs.map((c) => (c.id === activeConvId ? { ...c, messages: newMsgs, updatedAt: Date.now() } : c))
      );
      return newMsgs;
    });
  };

  const streamAssistantReply = async (fullText: string) => {
    setStreaming(true);
    let buffer = "";
    const id = `a_${Date.now()}`;
    pushMessage({ id, role: "assistant", type: "thinking", content: "" });

    for (let i = 0; i < fullText.length; i++) {
      buffer += fullText[i];
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: buffer } : m)));
      await new Promise((r) => setTimeout(r, 12));
    }

    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, type: "final" } : m)));
    setStreaming(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMsg = { id: `u_${Date.now()}`, role: "user", type: "final", content };
    pushMessage(userMsg);

    // 示例：多阶段回答
    await streamAssistantReply("这是 AI 的示例回答，可包含 markdown 和代码块。");
  };

  const sendImage = async () => {
    const uri = await pickImage();
    if (!uri) return;
    const imgMsg = { id: `i_${Date.now()}`, role: "user", type: "image", content: uri };
    pushMessage(imgMsg);
    await streamAssistantReply("AI 针对图片的示例回答");
  };

  const createConversation = () => {
    const id = `c_${Date.now()}`;
    const newConv = { id, title: "新会话", messages: [], updatedAt: Date.now() };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(id);
  };

  return {
    conversations,
    activeConvId,
    setActiveConvId,
    messages,
    streaming,
    sendMessage,
    sendImage,
    createConversation,
  };
}
