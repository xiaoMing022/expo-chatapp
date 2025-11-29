import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Redux 相关引入
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store"; // 假设你的 store 文件在 store/index.ts
import { loginUser, clearError } from "@/store/authSlice";

export default function LoginScreen() {
  // 为了测试方便，预设了默认值
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // 从 Redux 获取状态
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 监听登录成功跳转
  useEffect(() => {
    if (isAuthenticated) {
      // 可以在这里执行路由跳转，例如跳转到主页
      router.replace("/(tabs)/home"); 
      console.log("登录成功，用户信息已存入 Store 和 AsyncStorage");
      // 这里的跳转通常由父级路由控制，或者在这里手动 replace
    }
  }, [isAuthenticated]);

  // 监听错误信息
  useEffect(() => {
    if (error) {
      Alert.alert("登录失败", error, [{ text: "好的", onPress: () => dispatch(clearError()) }]);
    }
  }, [error]);

  const handleLogin = () => {
    Keyboard.dismiss();
    dispatch(loginUser({ email, password }));
  };

  const handleGoToRegister = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/register"); // 确保你有这个路由
    }
  };

  return (
    <LinearGradient
      colors={["#e0c3fc", "#8ec5fc"]}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.centerContent}>
            
            {/* 卡片容器 */}
            <View style={styles.card}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>使用测试账号直接登录体验</Text>
              </View>

              {/* Email 输入框 */}
              <View style={[styles.inputContainer, styles.shadowSm]}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="邮箱地址"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password 输入框 */}
              <View style={[styles.inputContainer, styles.shadowSm]}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="密码"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </Pressable>
              </View>

              {/* 忘记密码 */}
              <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 24 }}>
                <Text style={{ color: '#4f46e5', fontSize: 13, fontWeight: '600' }}>忘记密码?</Text>
              </View>

              {/* 登录按钮 (带 Loading 状态) */}
              <Pressable 
                onPress={handleLogin} 
                style={styles.loginBtnWrapper}
                disabled={isLoading} // 加载中禁止点击
              >
                <LinearGradient
                  colors={isLoading ? ["#a5b4fc", "#a5b4fc"] : ["#4f46e5", "#4338ca"]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.loginBtn}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.loginBtnText}>登 录</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* 分隔线 */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>快速登录</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 社交登录 */}
              <View style={styles.socialContainer}>
                <Pressable style={styles.socialBtnCircle}>
                  <Ionicons name="logo-google" size={22} color="#DB4437" />
                </Pressable>
                <Pressable style={styles.socialBtnCircle}>
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </Pressable>
                <Pressable style={styles.socialBtnCircle}>
                  <Ionicons name="logo-github" size={22} color="#333" />
                </Pressable>
              </View>
              
              {/* 底部注册 */}
              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>还没有账号? </Text>
                <Pressable onPress={handleGoToRegister} hitSlop={10}>
                  <Text style={styles.registerText}>立即注册</Text>
                </Pressable>
              </View>

            </View> 
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)", // 轻微透明增加质感
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 28,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "100%",
    height: 58,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  shadowSm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: "#1f2937",
    fontSize: 16,
    height: '100%',
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
  },
  loginBtnWrapper: {
    width: "100%",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 28,
    marginTop: 10,
  },
  loginBtn: {
    borderRadius: 18,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 36,
  },
  socialBtnCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  registerText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 14,
  },
});