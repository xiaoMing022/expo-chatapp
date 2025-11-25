import React, { forwardRef } from "react";
import { ScrollView, View } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/types/types";

type Theme = "light" | "dark";

interface Props {
  messages: Message[];
  theme: Theme;
}


export const MessageList = forwardRef<ScrollView, Props>(
  ({ messages, theme }, ref) => {
    return (
      <ScrollView
        ref={ref}
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
        className="custom-scrollbar"
      >
        <View className="flex flex-col custom-scrollbar">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} theme={theme} />
          ))}
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>
    );
  }
);

MessageList.displayName = "MessageList";
