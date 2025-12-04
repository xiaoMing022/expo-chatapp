import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import EventSource, { EventSourceListener } from "react-native-sse";
import { Message, Conversation, PendingFile } from "@/types/types";

// ------------------------------------------------------------------
// 1. 工具配置
// ------------------------------------------------------------------
const getApiUrl = () => {
  if (Platform.OS === 'web') return "http://localhost:3000/api/chat";
  if (Platform.OS === 'android') return "http://10.0.2.2:3000/api/chat";
  return "http://localhost:3000/api/chat";
};

// 生成前端临时 ID (确保 UI 列表 key 唯一)
const generateTempId = () => `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export const useChatSession = () => {
  // ------------------------------------------------------------------
  // 2. 状态定义
  // ------------------------------------------------------------------
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: generateTempId(),
      title: "新会话",
      messages: [{ id: "m_init", role: "assistant", type: "final", content: "你好！有什么可以帮你的吗？" }],
      updatedAt: Date.now(),
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0].id);
  const [messages, setMessages] = useState<Message[]>(conversations[0].messages);
  const [streaming, setStreaming] = useState(false);

  // ⭐ 关键 Ref：用于在 SSE 回调中获取最新的 ID，解决闭包旧值问题
  const activeIdRef = useRef(activeConvId);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ------------------------------------------------------------------
  // 3. 状态同步 (Ref <-> State <-> UI)
  // ------------------------------------------------------------------

  // 当 activeConvId 变化时，更新 Ref，并切换当前显示的消息列表
  useEffect(() => {
    activeIdRef.current = activeConvId; // 保持 Ref 最新
    const conv = conversations.find((c) => c.id === activeConvId);
    setMessages(conv ? conv.messages : []);
  }, [activeConvId, conversations]);

  // 组件卸载时，强制断开连接
  useEffect(() => {
    return () => closeConnection();
  }, []);

  const closeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.removeAllEventListeners();
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    console.log("✅ SSE 连接已关闭");
    setStreaming(false);
  };

  // ------------------------------------------------------------------
  // 4. 核心逻辑：ID 替换 (Temp -> Real UUID)
  // ------------------------------------------------------------------
  const replaceConversationId = useCallback((oldId: string, newId: string) => {
    console.log(`[ID Swap] 替换临时ID: ${oldId} -> ${newId}`);

    setConversations((prev) =>
      prev.map((c) => c.id === oldId ? { ...c, id: newId } : c)
    );

    // 如果当前正选中的是旧 ID，也要更新选中状态
    if (activeIdRef.current === oldId) {
      setActiveConvId(newId);
      activeIdRef.current = newId; // 立即更新 Ref，供后续流使用
    }
  }, []);

  // ------------------------------------------------------------------
  // 5. 消息操作
  // ------------------------------------------------------------------

  // 流式追加内容
  const appendMessageContent = useCallback((targetConvId: string, msgId: string, newText: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          // 只更新目标会话的消息
          const updatedMessages = c.messages.map((m) =>
            m.id === msgId ? { ...m, content: (m.content || "") + newText } : m
          );
          return { ...c, messages: updatedMessages };
        }
        return c;
      })
    );
  }, []);

  // ------------------------------------------------------------------
  // 6. 发送消息 (SSE)
  // ------------------------------------------------------------------
  const handleSendMessage = async (text: string, pendingImages: string[], pendingFiles: PendingFile[]) => {
    if (!text.trim() || streaming) return;

    console.log("[发送消息]", { text, pendingImages, pendingFiles });

    closeConnection(); // 发送前确保旧连接关闭
    setStreaming(true);

    const userMsgId = `u_${Date.now()}`;
    const botMsgId = `a_${Date.now()}`;

    // 获取发起请求时的 ID (可能是临时 c_xxx)
    const requestConvId = activeIdRef.current;
    let userMsg: Message;
    // A. 乐观更新 UI (先显示用户发的话)
    if (pendingImages.length > 0 || pendingFiles.length > 0) {
      console.log("[发送消息] 包含附件，图片数量:", pendingImages.length, "文件数量:", pendingFiles.length);
      userMsg = { id: userMsgId, role: "user", type: "image", content: text.trim(), images: pendingImages };

    } else userMsg = { id: userMsgId, role: "user", type: "final", content: text.trim(), images: pendingImages, files: pendingFiles };
    const botMsg: Message = { id: botMsgId, role: "assistant", type: "final", content: "" };

    setConversations(prev => prev.map(c =>
      c.id === requestConvId
        ? { ...c, messages: [...c.messages, userMsg, botMsg], updatedAt: Date.now() }
        : c
    ));

    const apiUrl = getApiUrl();
    console.log(`[SSE] 连接: ${apiUrl} | 会话ID: ${requestConvId}`);

    try {
      // B. 建立 SSE 连接
      // 注意：requestConvId 如果是 c_ 开头，后端会将其转为空字符串发给 Dify
      const es = new EventSource(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          query: text.trim(),
          conversation_id: requestConvId,
        }),
        pollingInterval: 0,
      });

      eventSourceRef.current = es;

      const listener: EventSourceListener = (event) => {
        // 连接建立
        if (event.type === "open") {
          console.log("✅ SSE 连接建立");
        }
        // 收到消息
        else if (event.type === "message") {
          try {
            console.log("SSE Event:", event);

            console.log("📨 SSE 收到消息:", event.data);

            // 结束标志
            if (event.data === "[DONE]") {
              console.log("✅ 传输完成");
              closeConnection();
              return;
            }

            const data = JSON.parse(event.data || "{}");

            // ⭐⭐⭐ 健壮性核心：ID 动态替换 ⭐⭐⭐
            // Dify 会在返回的数据包里携带真实的 conversation_id (UUID)
            // 如果我们当前还在用 c_ 开头的临时 ID，就立马换掉
            if (data.conversation_id &&
              activeIdRef.current.startsWith('c_') &&
              data.conversation_id !== activeIdRef.current) {

              replaceConversationId(activeIdRef.current, data.conversation_id);
            }

            // 处理文本追加
            // 始终向 activeIdRef.current (最新的 ID) 追加数据
            if ((data.event === "message" || data.event === "agent_message") && data.answer) {
              appendMessageContent(activeIdRef.current, botMsgId, data.answer);
            }

            // 处理服务端报错 (如 400, 500, 404)
            if (data.status && data.status !== 200) {
              console.error("服务端逻辑错误:", data);
              appendMessageContent(activeIdRef.current, botMsgId, `\n[错误: ${data.error || "未知服务错误"}]`);
              closeConnection();
            }

            if (data["event"] === "message_end") {
              console.log("✅ 传输完成");
              closeConnection();
              setStreaming(false);
              return;
            }

          } catch (e) {
            console.error("解析失败:", e);
          }
        }
        // 底层错误
        else if (event.type === "error") {
          console.error("❌ SSE 连接中断:", JSON.stringify(event));
          appendMessageContent(activeIdRef.current, botMsgId, "服务器维护中或网络异常，稍后再试！");

          // 使用 any 绕过 TS 检查，获取底层状态
          // const readyState = (es as any).readyState;

          // readyState 0 (Connecting) 或 2 (Closed) 通常意味着网络不通
          // if (readyState === 0 || readyState === 2) {
          //    appendMessageContent(activeIdRef.current, botMsgId, "\n[网络连接失败: 请检查 API_URL 是否正确]");
          // }
          closeConnection();
        }
      };

      es.addEventListener("open", listener);
      es.addEventListener("message", listener);
      es.addEventListener("error", listener);

    } catch (error) {
      console.error("初始化 SSE 失败:", error);
      appendMessageContent(requestConvId, botMsgId, "\n[初始化失败]");
      setStreaming(false);
    }
  };

  // ------------------------------------------------------------------
  // 7. 会话管理 (CRUD)
  // ------------------------------------------------------------------
  const createConversation = () => {
    const id = generateTempId();
    const newConv: Conversation = { id, title: "新会话", messages: [], updatedAt: Date.now() };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
  };

  const renameConversation = (id: string, newName: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newName } : c));
  };

  const deleteConversation = (id: string) => {
    const newConvs = conversations.filter(c => c.id !== id);
    setConversations(newConvs);
    if (id === activeConvId) {
      if (newConvs.length > 0) setActiveConvId(newConvs[0].id);
      else createConversation();
    }
  };

  return {
    conversations,
    activeConvId,
    setActiveConvId,
    messages, // 当前 UI 需要渲染的消息列表
    streaming,
    createConversation,
    renameConversation,
    deleteConversation,
    handleSendMessage
  };
};