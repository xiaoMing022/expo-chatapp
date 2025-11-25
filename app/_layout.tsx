// import { Stack, useSegments, useRouter } from "expo-router";
// import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
// import { zhCN } from "@clerk/localizations";

// import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
// import { ThemeProvider } from "@react-navigation/native";
// import { DarkTheme, DefaultTheme } from "@react-navigation/native";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { useEffect } from "react";
// import { tokenCache } from "@clerk/clerk-expo/token-cache";
// import "@/global.css";

// export default function RootLayout() {
//   return (
//     <ClerkProvider tokenCache={tokenCache} localization={zhCN} >
//       <AuthGate />
//     </ClerkProvider>
//   );
// }
 
// function AuthGate() {
//   const { isLoaded, isSignedIn } = useAuth();
//   const segments = useSegments();
//   const router = useRouter();
//   const colorScheme = useColorScheme();

//   // 🚀 控制路由跳转的核心逻辑
//   useEffect(() => {
//     if (!isLoaded) return;

//     const inAuthGroup = segments[0] === "(auth)";

//     if (!isSignedIn && !inAuthGroup) {
//       // 未登录 → 自动跳到登录页
//       router.replace("/sign-in");
//     }

//     if (isSignedIn && inAuthGroup) {
//       // 已登录 → 自动进入 tabs
//       router.replace("/(tabs)/home");
//     }
//   }, [isLoaded, isSignedIn, segments]);

//   return (
//     <GluestackUIProvider mode="dark">
//       <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="(auth)" />
//           <Stack.Screen name="(tabs)" />
//         </Stack>
//       </ThemeProvider>
//     </GluestackUIProvider>
//   );
// }

import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "@/global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode="dark">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 直接进入 Home 页面 */}
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}

