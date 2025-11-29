import { Slot, Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "@/global.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "@/store/authSlice";

// 创建一个内部组件来使用 dispatch
function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // APP 启动时检查是否有登录信息
    dispatch(loadUserFromStorage() as any);
  }, [dispatch]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 直接进入 Home 页面 */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </ThemeProvider>
      </Provider>
  );
}

