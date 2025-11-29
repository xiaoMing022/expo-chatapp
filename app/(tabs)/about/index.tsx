import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  Platform,
  Linking,
  Share,
  Modal,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// --- Redux 集成 ---
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store"; // 确保路径对应你的 store 文件
import { logoutUser } from "@/store/authSlice";

// --- 图标引入 ---
import { 
  User as UserIcon, 
  Settings, 
  Moon, 
  Globe, 
  Shield, 
  LogOut, 
  ChevronRight, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  Share2,
  X,
  Check
} from "lucide-react-native";

export default function AboutScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. 从 Redux 获取用户信息
  const { user } = useSelector((state: RootState) => state.auth);

  // 本地 UI 状态
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false); // 控制语言弹窗
  const [currentLang, setCurrentLang] = useState("zh"); // 模拟当前语言状态
  
  // 样式变量 (深色模式适配)
  const theme = isDarkMode ? "dark" : "light";
  const bgMain = theme === "dark" ? "#050508" : "#f9fafb";
  const bgCard = theme === "dark" ? "#121216" : "#ffffff";
  const textPrimary = theme === "dark" ? "#ffffff" : "#111827";
  const textSecondary = theme === "dark" ? "#9ca3af" : "#6b7280";
  const borderColor = theme === "dark" ? "#222" : "#f3f4f6";

  // --- 交互逻辑 ---

  // 退出登录 (Web 兼容处理)
  const handleLogout = () => {
    const performLogout = async () => {
      await dispatch(logoutUser());
      router.replace("/login"); 
    };

    if (Platform.OS === 'web') {
      // Web 端使用原生 confirm
      if (window.confirm("确定要退出当前账号吗？")) {
        performLogout();
      }
    } else {
      // 移动端使用原生 Alert
      Alert.alert(
        "退出登录",
        "确定要退出当前账号吗？",
        [
          { text: "取消", style: "cancel" },
          { text: "退出", style: "destructive", onPress: performLogout },
        ]
      );
    }
  };

  // 打开网页链接
  const openWebLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("无法打开链接", err));
  };

  // 分享应用
  const handleShare = async () => {
    try {
      await Share.share({
        message: '快来体验这款超棒的 AI 助手 App！',
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 检查更新
  const handleCheckUpdate = () => {
    const msg = "当前已是最新版本 v1.0.0";
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert("检查更新", msg);
    }
  };

  // 切换语言 (打开自定义 Modal)
  const handleLanguageSelect = (lang: string) => {
    setCurrentLang(lang);
    setLanguageModalVisible(false);
    // 这里可以添加实际切换 i18n 的逻辑
  };

  // --- 子组件: 设置项 ---
  const SettingItem = ({ 
    icon: Icon, 
    label, 
    value, 
    isSwitch = false, 
    onPress, 
    color = textPrimary 
  }: any) => (
    <TouchableOpacity
      onPress={isSwitch ? () => setIsDarkMode(!isDarkMode) : onPress}
      activeOpacity={isSwitch ? 1 : 0.7}
      className="flex-row items-center justify-between py-4 px-4 border-b last:border-b-0"
      style={{ borderColor: borderColor }}
    >
      <View className="flex-row items-center">
        <View className={`p-2 rounded-lg mr-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <Icon size={20} color={color} />
        </View>
        <Text style={{ color: textPrimary, fontSize: 16, fontWeight: "500" }}>
          {label}
        </Text>
      </View>
      
      <View className="flex-row items-center">
        {value && (
          <Text style={{ color: textSecondary, marginRight: 8, fontSize: 14 }}>
            {value}
          </Text>
        )}
        {isSwitch ? (
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: "#767577", true: "#4f46e5" }}
            thumbColor={"#f4f3f4"}
          />
        ) : (
          <ChevronRight size={18} color={textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgMain }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* 顶部标题栏 */}
          <View className="px-5 py-4 flex-row justify-between items-center">
            <Text style={{ color: textPrimary, fontSize: 28, fontWeight: "bold" }}>
              设置
            </Text>
            <TouchableOpacity onPress={handleShare} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Share2 size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          {/* --- 用户卡片区域 (Redux 数据) --- */}
          {user ? (
            <View className="mx-4 mb-6 p-4 rounded-2xl flex-row items-center shadow-sm"
              style={{ backgroundColor: bgCard }}
            >
              <View className="mr-4">
                {user.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-16 h-16 rounded-full bg-gray-200"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-indigo-500 items-center justify-center">
                    <Text className="text-white text-2xl font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1">
                <Text style={{ color: textPrimary, fontSize: 20, fontWeight: "bold", marginBottom: 2 }}>
                  {user.name || "用户"}
                </Text>
                <Text style={{ color: textSecondary, fontSize: 14, marginBottom: 6 }}>
                  {user.email}
                </Text>
                <View className="bg-indigo-100 dark:bg-indigo-900/30 self-start px-2 py-0.5 rounded-md">
                  <Text style={{ color: "#4f46e5", fontSize: 12, fontWeight: "600" }}>
                    PRO 会员
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity onPress={() => router.push("/profile-edit" as any)} className="p-2">
                 <Settings size={20} color={textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mx-4 mb-6 p-6 rounded-2xl items-center justify-center bg-gray-100">
               <Text>正在加载用户信息...</Text>
            </View>
          )}

          {/* --- 用量统计 --- */}
          <View className="mx-4 mb-6 flex-row gap-4">
             <View className="flex-1 p-4 rounded-xl shadow-sm" style={{ backgroundColor: bgCard }}>
                <Text style={{ color: textSecondary, fontSize: 12, marginBottom: 4 }}>已用 Token</Text>
                <Text style={{ color: textPrimary, fontSize: 20, fontWeight: "bold" }}>1,240</Text>
             </View>
             <View className="flex-1 p-4 rounded-xl shadow-sm" style={{ backgroundColor: bgCard }}>
                <Text style={{ color: textSecondary, fontSize: 12, marginBottom: 4 }}>剩余额度</Text>
                <Text style={{ color: textPrimary, fontSize: 20, fontWeight: "bold" }}>5,000</Text>
             </View>
          </View>

          {/* --- 设置组 1: 通用 --- */}
          <Text className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
            通用
          </Text>
          <View className="mx-4 mb-6 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard }}>
            <SettingItem 
              icon={UserIcon} 
              label="账户信息" 
              onPress={() => {}} 
            />
            <SettingItem 
              icon={CreditCard} 
              label="订阅管理" 
              value="管理"
              onPress={() => openWebLink("https://example.com/billing")} 
            />
            <SettingItem 
              icon={Moon} 
              label="深色模式" 
              isSwitch 
              onPress={() => {}} 
            />
             <SettingItem 
              icon={Globe} 
              label="语言" 
              value={currentLang === 'zh' ? "简体中文" : "English"}
              onPress={() => setLanguageModalVisible(true)} // 打开弹窗
            />
          </View>

          {/* --- 设置组 2: 支持与关于 --- */}
          <Text className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>
            关于
          </Text>
          <View className="mx-4 mb-8 rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard }}>
            <SettingItem 
              icon={HelpCircle} 
              label="帮助中心" 
              onPress={() => openWebLink("https://example.com/help")} 
            />
            <SettingItem 
              icon={Shield} 
              label="隐私政策" 
              onPress={() => openWebLink("https://google.com")} 
            />
             <SettingItem 
              icon={FileText} 
              label="服务条款" 
              onPress={() => openWebLink("https://google.com")} 
            />
            <SettingItem 
              icon={Settings} 
              label="版本检查" 
              value="v1.0.0"
              onPress={handleCheckUpdate} 
            />
          </View>

          {/* --- 退出登录按钮 --- */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="mx-4 mb-10 p-4 rounded-xl flex-row items-center justify-center bg-red-50 dark:bg-red-900/10"
            activeOpacity={0.8}
          >
             <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
             <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>退出登录</Text>
          </TouchableOpacity>

          <View className="items-center pb-4">
             <Text style={{ color: textSecondary, fontSize: 12 }}>Build with React Native & Expo</Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* --- 自定义语言选择 Modal (适配 Web/iOS/Android) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setLanguageModalVisible(false)}
        >
          <Pressable 
            style={{ 
              backgroundColor: bgCard, 
              borderTopLeftRadius: 24, 
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 40 + (Platform.OS === 'ios' ? 10 : 0), // 简单适配底部
              maxHeight: '50%'
            }}
            onPress={e => e.stopPropagation()} // 防止点击内容区关闭
          >
            {/* Modal 标题 */}
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textPrimary }}>选择语言</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)} className="p-1">
                <X size={24} color={textSecondary} />
              </TouchableOpacity>
            </View>

            {/* 语言选项 */}
            <View className="gap-3">
              {['zh', 'en'].map((langKey) => {
                const isSelected = currentLang === langKey;
                const label = langKey === 'zh' ? '简体中文' : 'English';
                
                return (
                  <TouchableOpacity
                    key={langKey}
                    onPress={() => handleLanguageSelect(langKey)}
                    className="flex-row items-center justify-between p-4 rounded-xl"
                    style={{ 
                      backgroundColor: isSelected 
                        ? (theme === 'dark' ? 'rgba(79, 70, 229, 0.2)' : '#e0e7ff') 
                        : (theme === 'dark' ? '#1f1f26' : '#f3f4f6') 
                    }}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: isSelected ? '600' : '400',
                      color: isSelected ? '#4f46e5' : textPrimary 
                    }}>
                      {label}
                    </Text>
                    {isSelected && <Check size={20} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}