// MessageBubble.tsx
import React from "react";
import { View, Text, Image } from "react-native";
import Markdown from "react-native-markdown-display";
import { Message } from "@/types/types";

interface Props {
  msg: Message;
  theme: "light" | "dark";
}

export const MessageBubble: React.FC<Props> = ({ msg, theme }) => {
  const isUser = msg.role === "user";
  const bubbleBg = isUser ? "#4f46e5" : "#ffffff"; // 浅紫色或白色
  const textColor = isUser ? "#ffffff" : "#000000"; // 文字黑色

  if (msg.type === "image") {
    return (
      <View className={`my-2 ${isUser ? "self-end" : "self-start"}`}>
        <Image source={{ uri: msg.content }} className="w-56 h-36 rounded-lg" />
      </View>
    );
  }

  return (
    <View
      className={`my-2 px-4 py-2 rounded-xl max-w-[75%] ${isUser ? "self-end" : "self-start"}`}
      style={{
        backgroundColor: bubbleBg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <Markdown
        style={{
          body: { color: textColor },
          code_inline: {
            backgroundColor: theme === "dark" ? "#2b2b2b" : "#f0f0f0",
            padding: 4,
            borderRadius: 4,
            color: textColor,
          },
          code_block: {
            padding: 8,
            borderRadius: 6,
            backgroundColor: theme === "dark" ? "#2b2b2b" : "#f0f0f0",
            color: textColor,
          },
        }}
      >
        {msg.content}
      </Markdown>
    </View>
  );
};
