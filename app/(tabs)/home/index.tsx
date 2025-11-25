import React, { useState, useRef, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopBar } from "@components/chat/TopBar";
import { DrawerMenu } from "@components/chat/DrawerMenu";
// 确保 ChatInput 的 props 已经更新以匹配多图支持
import { ChatInput } from "@components/chat/ChatInput";
import { MessageList } from "@components/chat/MessageList";

type Theme = "light" | "dark";

import { Message, PendingFile } from "@/types/types";



interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

// 假设底部 Tab 栏高度，用于 iOS 上的 KeyboardAvoidingView 偏移计算
const TAB_BAR_HEIGHT = 50;

export default function HomeScreen() {
  const { isLarge, isSmall } = useBreakpoint();

  const [theme, setTheme] = useState<Theme>("light");
  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "c1",
      title: "示例会话1",
      messages: [
        {
          id: "m1",
          role: "assistant",
          type: "final",
          content: "欢迎使用 AI 助手！",
        },
      ],
      updatedAt: Date.now(),
    },
  ]);

  const [activeConvId, setActiveConvId] = useState(conversations[0].id);
  const [messages, setMessages] = useState<Message[]>(conversations[0].messages);
  // ⭐⭐⭐ 状态更新：支持多个待发送图片 URI 数组 ⭐⭐⭐
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  // ⭐ 关键：新增 pendingFiles 状态，并初始化为空数组
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const scrollRef = useRef<ScrollView>(null);

  // 更新 messages 当 activeConvId 或 conversations 变化
  useEffect(() => {
    const conv = conversations.find(c => c.id === activeConvId);
    setMessages(conv ? conv.messages : []);
  }, [activeConvId, conversations]);

  // 自动滚动到底部
  useEffect(() => {
    // 滚动时依赖 messages 和 pendingImages 确保内容和预览图出现后滚动
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages, pendingImages]);

  // 新增消息到当前会话
  const pushMessage = (msg: Message) => {
    setMessages(prev => {
      const newMsgs: Message[] = [...prev, msg];
      setConversations(convs =>
        convs.map(c =>
          c.id === activeConvId ? { ...c, messages: newMsgs, updatedAt: Date.now() } : c
        )
      );
      return newMsgs;
    });
  };

  // 发送消息
  const sendMessage = () => {
    // ⭐⭐⭐ 逻辑更新：检查 pendingImages 数组长度 ⭐⭐⭐
    if (!input.trim() && pendingImages.length === 0) return;

    const newMessages: Message[] = [];

    // ⭐⭐⭐ 逻辑更新：遍历 pendingImages 数组，将每张图作为消息发送 ⭐⭐⭐
    if (pendingImages.length > 0) {
      pendingImages.forEach(uri => {
        newMessages.push({
          id: `i_${Date.now()}_${Math.random()}`,
          role: "user",
          type: "image",
          content: uri,
        });
      });
      setPendingImages([]); // 清空待发送图片
    }

    if (input.trim()) {
      newMessages.push({
        id: `u_${Date.now()}`,
        role: "user",
        type: "final",
        content: input.trim(),
      });
      setInput("");
    }

    if (newMessages.length > 0) {
      newMessages.forEach(msg => pushMessage(msg));

      // 模拟 AI 回复
      pushMessage({
        id: `a_${Date.now()}`,
        role: "assistant",
        type: "final",
        content: "这是模拟回答。",
      });

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  };

  const createConversation = () => {
    const id = `c_${Date.now()}`;
    const newConv: Conversation = { id, title: "新会话", messages: [], updatedAt: Date.now() };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(id);
  };

  const handleUpload = async () => {
    console.log("上传按钮被点击");
    // 弹出选择菜单
    Alert.alert(
        "选择上传内容",
        "您想上传图片/视频，还是其他类型文件（如 PDF, DOCX 等）?",
        [
            {
                text: "图片/视频",
                onPress: pickImage, // 调用图片选择函数
            },
            {
                text: "其他文件",
                onPress: handleDocumentPicker, // 调用文件选择函数
            },
            {
                text: "取消",
                style: "cancel"
            }
        ]
    );
};

  // ⭐⭐⭐ 逻辑更新：支持多图选择，并添加到 pendingImages 数组 ⭐⭐⭐
  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return alert("需要图库权限");

    const r2 = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true, // 启用多选
    });
    if (r2.canceled || !r2.assets) return;

    // 将所有选中的 URI 添加到 pendingImages 数组中
    const newUris = r2.assets.map(asset => asset.uri);
    setPendingImages(prev => [...prev, ...newUris]);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  // 2. 处理通用文件选择的函数
// ----------------------------------------------------
const handleDocumentPicker = async () => {
    try {
        // 在 Web 和某些平台上，DocumentPicker 不需要额外的权限
        
        const result = await DocumentPicker.getDocumentAsync({
            // 选择所有文件类型
            type: '*/*', 
            copyToCacheDirectory: true, // 建议复制到缓存目录，以确保 URI 可用
            multiple: true, // 启用多选
        });

        // 检查是否取消或发生错误
        if (result.canceled) {
            return; 
        }

        // 格式化结果为 PendingFile 接口需要的格式
        const newFiles = result.assets.map(asset => ({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType || 'application/octet-stream', // 使用 mimeType
            size: asset.size || 0,
        }));
        
        // 更新文件状态
        setPendingFiles(prev => [...prev, ...newFiles]);

        // 滚动到底部 (假设 scrollRef 可用)
        // setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    } catch (error) {
        console.error("文件选择失败:", error);
        alert("文件选择失败，请重试。");
    }
};

  return (
    <View className={`flex-1 ${theme === "dark" ? "bg-black" : "bg-gray-100"}`}>
      {/* 优化1：只处理顶部安全区域，消除底部 Tab 栏多余间距 */}
      <SafeAreaView className="flex-1" edges={["top"]}>
        <TopBar
          theme={theme}
          toggleTheme={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
          onOpenDrawer={() => setOpen(true)}
        />

        <View className={`flex-1 ${isLarge ? "flex-row" : "flex-col"}`}>
          {isLarge && (
            <DrawerMenu
              isOpen={true}
              onClose={() => { }}
              conversations={conversations}
              activeConvId={activeConvId}
              setActiveConvId={setActiveConvId}
              createConversation={createConversation}
              theme={theme}
            />
          )}

          {/* 优化2：键盘避让视图，确保输入框在键盘上方 */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? TAB_BAR_HEIGHT : 0}
          >
            {/* <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
              className="custom-scrollbar"
            >
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} theme={theme} />
              ))}


              <View style={{ height: 16 }} />
            </ScrollView> */}
            <MessageList messages={messages} theme={theme} ref={scrollRef} />

            {/* ⭐⭐⭐ ChatInput 属性更新 ⭐⭐⭐ */}
            <ChatInput
              input={input}
              setInput={setInput}
              pendingImages={pendingImages} // 传递数组
              setPendingImages={setPendingImages} // 传递设置数组的函数
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              onSend={sendMessage}
              // onUpload={pickImage}
              onUpload={handleUpload}
              theme={theme}
              streaming={streaming}
            />
          </KeyboardAvoidingView>
        </View>

        {isSmall && (
          <DrawerMenu
            isOpen={open}
            onClose={() => setOpen(false)}
            conversations={conversations}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            createConversation={createConversation}
            theme={theme}
          />
        )}
      </SafeAreaView>
    </View>
  );
}