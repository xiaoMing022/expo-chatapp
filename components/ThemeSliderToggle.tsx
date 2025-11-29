import React, { useEffect, useRef } from "react";
import { Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  theme: "dark" | "light";
  onToggle: () => void;
}

export const ThemeToggleButton: React.FC<Props> = ({ theme, onToggle }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  const fadeMoon = useRef(new Animated.Value(1)).current;
  const fadeSun = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (theme === "dark") {
      Animated.parallel([
        Animated.timing(fadeSun, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeMoon, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => rotate.setValue(0));
    } else {
      Animated.parallel([
        Animated.timing(fadeMoon, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeSun, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [theme]);

  return (
    <Pressable onPress={onToggle} style={{ padding: 6, width: 28, height: 28 }}>
      {/* 月亮：更优雅的颜色 */}
      <Animated.View
        style={{
          position: "absolute",
          opacity: fadeMoon,
          transform: [
            {
              rotate: rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <Ionicons name="moon" size={22} color="#4f46e5" />
      </Animated.View>

      {/* 太阳 */}
      <Animated.View
        style={{
          position: "absolute",
          opacity: fadeSun,
          transform: [
            {
              rotate: rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <Ionicons name="sunny" size={24} color="#facc15" />
      </Animated.View>
    </Pressable>
  );
};
