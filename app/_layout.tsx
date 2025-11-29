import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "@/global.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, RootState } from "@/store"; // 确保引入 RootState 类型
import { useEffect, useState } from "react";
import { loadUserFromStorage } from "@/store/authSlice";
import { View, ActivityIndicator } from "react-native";

// --- 核心逻辑组件：负责初始化和路由保护 ---
function InitialLayout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments(); // 获取当前路由片段
  const colorScheme = useColorScheme();

  // 获取 Redux 中的认证状态和加载状态
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  // 本地状态：确保初始化检查完成（避免Redux还在读取本地存储时就跳转）
  const [isReady, setIsReady] = useState(false);

  // 1. App 启动时，从 AsyncStorage 加载用户信息
  useEffect(() => {
    const initApp = async () => {
      await dispatch(loadUserFromStorage() as any);
      setIsReady(true); // 标记初始化完成
    };
    initApp();
  }, [dispatch]);

  // 2. 监听路由和登录状态，自动跳转
  useEffect(() => {
    if (!isReady) return; // 如果还没初始化完，不执行跳转

    const inAuthGroup = segments[0] === "(auth)"; // 当前是否在登录/注册页
    
    if (isAuthenticated && inAuthGroup) {
      // 场景A：已登录，但还在登录页 ->以此跳转到主页
      router.replace("/home"); 
    } else if (!isAuthenticated && !inAuthGroup) {
      // 场景B：未登录，且不在登录页 -> 强制踢回登录页
      // 假设你的登录页路由是 /login 或 /(auth)/login
      router.replace("/login"); 
    }
  }, [isAuthenticated, segments, isReady]);

  // 3. 如果正在加载或初始化中，显示加载转圈，防止白屏或闪烁
  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // 4. 加载完成，渲染正常的导航结构
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 定义主页 Tab 路由 */}
        <Stack.Screen name="(tabs)" />
        {/* 定义认证路由 (登录/注册) */}
        <Stack.Screen name="(auth)" />
        {/* 如果有其他独立页面，例如 404 */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

// --- 根组件：只负责包裹 Provider ---
export default function RootLayout() {
  return (
    <Provider store={store}>
      <InitialLayout />
    </Provider>
  );
}