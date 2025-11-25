import React from "react";
import { View, TextInput, Pressable, Text, NativeSyntheticEvent, TextInputSubmitEditingEventData } from "react-native";

interface ChatInputProps {
  input: string;
  setInput: (text: string) => void;
  onSend: () => void;
  onUpload: () => void;
  theme: "dark" | "light";
  streaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSend, onUpload, theme, streaming }) => {
  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (!streaming && input.trim()) {
      onSend();
    }
  };

  return (
    <View
      className={`
        flex-row 
        items-center 
        p-3 
        border-t 
        ${theme === "dark" ? "bg-black border-gray-800" : "bg-white border-gray-200"}
      `}
    >
      {/* 上传按钮 */}
      <Pressable onPress={onUpload} className="mr-2 justify-center">
        <Text className={theme === "dark" ? "text-white" : "text-black"}>上传</Text>
      </Pressable>

      {/* 输入框 */}
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="发送消息..."
        placeholderTextColor={theme === "dark" ? "#888" : "#555"}
        className={`
          flex-1 
          rounded-lg 
          px-3 
          py-2 
          ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-200 text-black"}
        `}
        returnKeyType="send"
        onSubmitEditing={handleSubmitEditing}
      />

      {/* 发送按钮 */}
      <Pressable
        onPress={onSend}
        className="ml-2 rounded-lg px-4 py-2 justify-center bg-indigo-600"
      >
        <Text className="text-white">{streaming ? "..." : "发送"}</Text>
      </Pressable>
    </View>
  );
};
