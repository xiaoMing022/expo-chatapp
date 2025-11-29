import React, { useState } from "react";
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
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // 假设你使用 expo-router

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter(); // 用于跳转
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    console.log("Registering:", name, email, password);
    // 这里执行注册逻辑
  };

  const handleGoToLogin = () => {
    // 根据你的路由逻辑调整，如果是在 stack 中通常是 back 或 replace
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  };

  return (
    <LinearGradient
      colors={["#e0c3fc", "#8ec5fc"]} // 保持与登录页一致的渐变
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centerContent}>
              
              {/* 卡片容器 */}
              <View style={styles.card}>
                
                {/* 标题区域 */}
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>创建账号</Text>
                  <Text style={styles.subtitle}>注册以开启您的精彩旅程</Text>
                </View>

                {/* 1. 昵称/姓名 输入框 */}
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="您的昵称"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                    autoCorrect={false}
                  />
                </View>

                {/* 2. 邮箱 输入框 */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="电子邮箱"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* 3. 密码 输入框 */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="设置密码"
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

                {/* 服务条款 (UX 细节) */}
                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    点击注册即代表您同意我们的
                    <Text style={styles.linkText}> 服务条款 </Text>
                    和
                    <Text style={styles.linkText}> 隐私政策</Text>
                  </Text>
                </View>

                {/* 注册按钮 */}
                <Pressable onPress={handleRegister} style={styles.registerBtnWrapper}>
                  <LinearGradient
                    colors={["#4c669f", "#3b5998"]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={styles.registerBtn}
                  >
                    <Text style={styles.registerBtnText}>立即注册</Text>
                  </LinearGradient>
                </Pressable>

                {/* 分隔线 */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>其他方式注册</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* 社交按钮组 */}
                <View style={styles.socialContainer}>
                  <Pressable style={styles.socialBtnCircle}>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                  </Pressable>
                  <Pressable style={styles.socialBtnCircle}>
                    <Ionicons name="logo-apple" size={24} color="#000" />
                  </Pressable>
                </View>
                
                {/* 底部跳转登录 */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>已有账号? </Text>
                  <Pressable onPress={handleGoToLogin}>
                    <Text style={styles.loginLinkText}>去登录</Text>
                  </Pressable>
                </View>

              </View> 
              {/* End of Card */}
              
            </View>
          </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40, // 给予上下一些空间，防止卡片贴边
  },
  centerContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // 卡片核心样式
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    // 阴影效果
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26, // 比登录页稍微小一点点，或者保持一致
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "100%",
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#1f2937",
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#4c669f",
    fontWeight: "600",
  },
  registerBtnWrapper: {
    width: "100%",
    shadowColor: "#3b5998",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  registerBtn: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  registerBtnText: {
    color: "#fff",
    fontWeight: "bold",
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
    marginHorizontal: 10,
    color: "#9ca3af",
    fontSize: 12,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 32,
  },
  socialBtnCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: "#6b7280",
    fontSize: 14,
  },
  loginLinkText: {
    color: "#4c669f",
    fontWeight: "bold",
    fontSize: 14,
  },
});