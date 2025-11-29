import React from "react";
import { View, Text, Pressable } from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ThemeToggleButton } from "@/components/ThemeSliderToggle";

interface TopBarProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  onOpenDrawer?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ theme, toggleTheme, onOpenDrawer }) => {
  const { isSmall } = useBreakpoint();
  const textColor = theme === "dark" ? "white" : "black";
  const bgColor = theme === "dark" ? "#0f0f13" : "#f3f4f6";
  const borderColor = theme === "dark" ? "#222" : "#eee";

  return (
    <View style={{ height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, borderBottomWidth: 1, borderColor, backgroundColor: bgColor }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {isSmall && onOpenDrawer && (
          <Pressable onPress={onOpenDrawer} style={{ marginRight: 12 }}>
            <Text style={{ color: textColor, fontSize: 20 }}>☰</Text>
          </Pressable>
        )}
        <Text style={{ fontWeight: "bold", fontSize: 16, color: textColor }}>DUDU 🐷</Text>
      </View>

      <ThemeToggleButton theme={theme} onToggle={toggleTheme} />


    </View>
  );
};
