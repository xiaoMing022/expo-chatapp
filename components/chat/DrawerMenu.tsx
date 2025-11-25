import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Drawer, DrawerBackdrop, DrawerContent, DrawerBody, DrawerHeader } from "@/components/ui/drawer";
import { VStack } from "@/components/ui/vstack";
import { useBreakpoint } from "@/hooks/useBreakpoint";
// 引入 useSafeAreaInsets 钩子
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: any[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  createConversation: () => void;
  theme: "light" | "dark";
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConvId,
  setActiveConvId,
  createConversation,
  theme,
}) => {
  const { isSmall } = useBreakpoint();
  const textColor = theme === "dark" ? "white" : "black";
  
  // ⭐ 获取安全区域插边值
  const insets = useSafeAreaInsets(); 

  const MenuContent = () => (
    <View style={{ padding: 12 }}>
      <TouchableOpacity onPress={createConversation} style={{ marginBottom: 12 }}>
        <Text style={{ color: textColor }}>+ 新建会话</Text>
      </TouchableOpacity>
      <ScrollView style={{ marginBottom: 12 }}>
        {conversations.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => {
              setActiveConvId(c.id);
              if (isSmall) onClose(); // 小屏幕点击关闭 Drawer
            }}
            style={{ padding: 12, borderBottomWidth: 1, borderColor: theme === "dark" ? "#1b1b1b" : "#f0f0f0" }}
          >
            <Text style={{ color: c.id === activeConvId ? "#6b6bff" : textColor, fontWeight: c.id === activeConvId ? "bold" : "normal" }}>
              {c.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (isSmall) {
    // 小屏幕 Drawer 弹出 (由 DrawerHeader/DrawerBody 自动处理安全区)
    return (
      <Drawer isOpen={isOpen} onClose={onClose} anchor="left">
        <DrawerBackdrop onPress={onClose} />
        <DrawerContent className="w-4/5" style={{ backgroundColor: theme === "dark" ? "#0f0f13" : "#ffffff" }}>
          <DrawerHeader>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: textColor }}>会话</Text>
          </DrawerHeader>
          <DrawerBody>
            <MenuContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // ⭐⭐⭐ 大屏幕固定显示 (新增顶部内边距) ⭐⭐⭐
  return (
    <View
      style={{
        width: 280,
        backgroundColor: theme === "dark" ? "#050508" : "#fff",
        borderRightWidth: 1,
        borderColor: theme === "dark" ? "#222" : "#eee",
        // ⭐ 应用顶部安全区域插边作为 paddingTop，只在 iOS 设备上应用
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
      }}
    >
      <MenuContent />
    </View>
  );
};