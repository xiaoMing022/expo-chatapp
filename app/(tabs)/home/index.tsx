import React, { useState, useRef, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBreakpoint } from "@/hooks/useBreakpoint";

// UI Components
import { TopBar } from "@components/chat/TopBar";
import { DrawerMenu } from "@components/chat/DrawerMenu";
import { ChatInput } from "@components/chat/ChatInput";
import { MessageList } from "@components/chat/MessageList";

// Logic Hooks
import { useAttachments } from "@/hooks/useAttachments";
import { useChatSession } from "@/hooks/useChatSession";
import { UploadModal } from "@/components/chat/UploadModal";

// Types
type Theme = "light" | "dark";
const TAB_BAR_HEIGHT = 50;

export default function HomeScreen() {
  const { isLarge, isSmall } = useBreakpoint();
  const [theme, setTheme] = useState<Theme>("light");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const {
    conversations,
    activeConvId,
    setActiveConvId,
    messages,
    streaming,
    createConversation,
    renameConversation,
    deleteConversation,
    handleSendMessage,
  } = useChatSession();

  const {
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    pickImage,
    pickDocument,
    clearAttachments,
  } = useAttachments();


  // 自动滚动逻辑
  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  // 监听消息或附件变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingImages, pendingFiles]);

  // 统一发送处理
  const onSend = () => {
    handleSendMessage(input, pendingImages, pendingFiles);

    // handleSendMessage(input);//测试版仅考虑文本消息
    setInput("");
    clearAttachments(); // 发送后清空附件
  };

  // 2. 修改 onUploadPress，只负责打开 Modal
  const onUploadPress = () => {
    setUploadModalVisible(true);
  };

  // 3. 定义具体的选择处理函数 (连接 Modal 和 Hook)
  const handleSelectImage = async () => {
    const hasNew = await pickImage();
    if (hasNew) scrollToBottom();
  };

  const handleSelectDocument = async () => {
    const hasNew = await pickDocument();
    if (hasNew) scrollToBottom();
  };

  return (
    <View className={`flex-1 ${theme === "dark" ? "bg-black" : "bg-gray-100"}`}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* 顶部栏 */}
        <TopBar
          theme={theme}
          toggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onOpenDrawer={() => setOpenDrawer(true)}
        />

        <View className={`flex-1 ${isLarge ? "flex-row" : "flex-col"}`}>
          {/* 大屏侧边栏 */}
          {isLarge && (
            <DrawerMenu
              isOpen={true}
              onClose={() => { }}
              conversations={conversations}
              activeConvId={activeConvId}
              setActiveConvId={setActiveConvId}
              createConversation={createConversation}
              theme={theme}
              onRenameConversation={renameConversation}
              onDeleteConversation={deleteConversation}
            />
          )}

          {/* 主聊天区域 */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? TAB_BAR_HEIGHT : 0}
          >
            <MessageList messages={messages} theme={theme} ref={scrollRef} />

            <ChatInput
              input={input}
              setInput={setInput}
              pendingImages={pendingImages}
              setPendingImages={setPendingImages}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              onSend={onSend}
              onUpload={onUploadPress} // 传递封装后的上传处理函数
              theme={theme}
              streaming={streaming}
            />
          </KeyboardAvoidingView>
        </View>

        {/* 小屏侧边栏 (抽屉) */}
        {isSmall && (
          <DrawerMenu
            isOpen={openDrawer}
            onClose={() => setOpenDrawer(false)}
            conversations={conversations}
            activeConvId={activeConvId}
            setActiveConvId={setActiveConvId}
            createConversation={createConversation}
            theme={theme}
            onRenameConversation={renameConversation}
            onDeleteConversation={deleteConversation}
          />
        )}
        <UploadModal
          visible={uploadModalVisible}
          onClose={() => setUploadModalVisible(false)}
          onSelectImage={handleSelectImage}
          onSelectFile={handleSelectDocument}
        />
      </SafeAreaView>
    </View>
  );
}