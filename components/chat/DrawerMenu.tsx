import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  TextInput,
  Alert,
  Keyboard,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet
} from "react-native";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// 图标
import {
  Plus,
  MessageSquare,
  Settings,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react-native";

interface Conversation {
  id: string;
  title: string;
}

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  createConversation: () => void;
  onRenameConversation: (id: string, newName: string) => void;
  onDeleteConversation: (id: string) => void;
  theme: "light" | "dark";
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onOpenSettings?: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConvId,
  setActiveConvId,
  createConversation,
  onRenameConversation,
  onDeleteConversation,
  theme,
  userInfo = { name: "User", email: "user@example.com" },
  onOpenSettings = () => {},
}) => {
  const { isSmall } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  
  // --- 动画状态 (仅针对小屏 Modal) ---
  const [modalVisible, setModalVisible] = useState(false);
  // 侧边栏位移：初始在屏幕左侧之外 (-300)
  const slideAnim = useRef(new Animated.Value(-300)).current; 
  // 背景透明度：初始为 0
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- 监听 isOpen 变化控制动画 ---
  useEffect(() => {
    if (isSmall) {
      if (isOpen) {
        setModalVisible(true);
        // 并行执行：侧边栏滑入 + 背景变暗
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true, // 启用原生驱动，性能极佳
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // 关闭时：先动画，后隐藏 Modal
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -300, // 滑回左侧
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setModalVisible(false);
        });
      }
    }
  }, [isOpen, isSmall]);

  // --- 业务逻辑状态 (保持不变) ---
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<TextInput>(null);

  // --- 样式常量 ---
  const isDark = theme === "dark";
  const bgMain = isDark ? "#050508" : "#ffffff";
  const bgActive = isDark ? "#1f1f26" : "#e0e7ff";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const borderColor = isDark ? "#27272a" : "#e5e7eb";
  const accentColor = isDark ? "#818cf8" : "#4f46e5";
  const dangerColor = isDark ? "#f87171" : "#ef4444";

  // --- 交互处理函数 (保持不变) ---
  const startEditing = (id: string, currentTitle: string) => {
    setActionMenuId(null);
    setEditTitle(currentTitle);
    setEditingId(id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    Keyboard.dismiss();
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm("确定要删除这个会话吗？")) {
        onDeleteConversation(id);
        setActionMenuId(null);
      }
      return;
    }
    Alert.alert("删除会话", "确定要删除这个会话吗？", [
      { text: "取消", style: "cancel", onPress: () => setActionMenuId(null) },
      { text: "删除", style: "destructive", onPress: () => { onDeleteConversation(id); setActionMenuId(null); } },
    ]);
  };

  // --- 核心内容组件 (复用) ---
  const SidebarContent = () => (
    <View style={{ flex: 1, backgroundColor: bgMain }}>
      {/* 1. 新建会话 */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16 }}>
        <TouchableOpacity
          onPress={createConversation}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: isDark ? "#444" : "#ccc",
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "transparent",
          }}
        >
          <Plus size={18} color={textPrimary} style={{ marginRight: 8 }} />
          <Text style={{ color: textPrimary, fontWeight: "600" }}>新建会话</Text>
        </TouchableOpacity>
      </View>

      {/* 2. 列表区域 */}
      <View style={{ flex: 1 }}>
        <Text style={{ paddingHorizontal: 20, paddingBottom: 8, fontSize: 12, fontWeight: "500", color: textSecondary, textTransform: "uppercase" }}>
          最近会话
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          onTouchStart={() => {
             if (actionMenuId) setActionMenuId(null);
             if (editingId && Platform.OS !== 'web') Keyboard.dismiss();
          }}
        >
          {conversations.map((c) => {
            const isActive = c.id === activeConvId;
            const isMenuOpen = c.id === actionMenuId;
            const isEditing = c.id === editingId;

            return (
              <View
                key={c.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  marginBottom: 4,
                  backgroundColor: isActive && !isEditing ? bgActive : "transparent",
                  borderWidth: 1,
                  borderColor: isEditing ? accentColor : "transparent",
                }}
              >
                {!isEditing && (
                  <MessageSquare size={16} color={isActive ? accentColor : textSecondary} style={{ marginRight: 10 }} />
                )}

                <View style={{ flex: 1, justifyContent: "center" }}>
                  {isEditing ? (
                    <TextInput
                      ref={inputRef}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      onSubmitEditing={submitRename}
                      blurOnSubmit={false}
                      style={{
                        color: textPrimary,
                        padding: 0,
                        fontSize: 14,
                        height: 24,
                        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) 
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => { setActiveConvId(c.id); if (isSmall) onClose(); }}
                      onLongPress={() => setActionMenuId(c.id)}
                      style={{ height: 24, justifyContent: 'center' }}
                    >
                      <Text numberOfLines={1} style={{ color: isActive ? textPrimary : textSecondary, fontWeight: isActive ? "600" : "400" }}>
                        {c.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 操作按钮 */}
                <View style={{ flexDirection: "row", marginLeft: 4 }}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity onPress={submitRename} style={{ padding: 4 }}><Check size={16} color={accentColor} /></TouchableOpacity>
                      <TouchableOpacity onPress={cancelEditing} style={{ padding: 4 }}><X size={16} color={textSecondary} /></TouchableOpacity>
                    </>
                  ) : isMenuOpen ? (
                    <>
                      <TouchableOpacity onPress={() => startEditing(c.id, c.title)} style={{ padding: 4, marginHorizontal: 2, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", borderRadius: 4 }}><Edit2 size={14} color={textPrimary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(c.id)} style={{ padding: 4, marginHorizontal: 2, backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 4 }}><Trash2 size={14} color={dangerColor} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => setActionMenuId(null)} style={{ padding: 4 }}><X size={14} color={textSecondary} /></TouchableOpacity>
                    </>
                  ) : (
                    (isActive || !isSmall) && (
                      <TouchableOpacity onPress={() => setActionMenuId(prev => prev === c.id ? null : c.id)} style={{ padding: 4, opacity: 0.6 }} hitSlop={10}>
                        <MoreVertical size={14} color={textSecondary} />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. 底部用户信息 */}
      {/* <View style={{ borderTopWidth: 1, borderColor: borderColor, padding: 16, paddingBottom: Platform.OS === "ios" && !isSmall ? Math.max(insets.bottom, 20) : 20 }}>
        <TouchableOpacity
          onPress={onOpenSettings}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 8,
            borderRadius: 12,
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"
          }}
        >
          <View style={{ height: 40, width: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden", backgroundColor: accentColor }}>
            {userInfo.avatar ? (
              <Image source={{ uri: userInfo.avatar }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{userInfo.name?.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: textPrimary, fontWeight: "600", fontSize: 14 }} numberOfLines={1}>{userInfo.name}</Text>
            <Text style={{ color: textSecondary, fontSize: 12 }} numberOfLines={1}>{userInfo.email}</Text>
          </View>
          <Settings size={20} color={textSecondary} />
        </TouchableOpacity>
      </View> */}
    </View>
  );

  // === 最终渲染 ===

  // 1. 小屏幕：使用原生 Modal 实现的 Drawer
  if (isSmall) {
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={onClose} // Android 物理返回键处理
        animationType="none" // 我们自己处理动画
      >
        {/* 背景遮罩 (Fade In/Out) */}
        <Animated.View 
          style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: fadeAnim 
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        {/* 侧边栏主体 (Slide In/Out) */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: "80%", // 侧边栏宽度
            maxWidth: 320,
            backgroundColor: bgMain,
            // 应用位移动画
            transform: [{ translateX: slideAnim }],
            // 阴影效果
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          {/* 顶部安全区 */}
          <View style={{ height: insets.top }} />
          <SidebarContent />
        </Animated.View>
      </Modal>
    );
  }

  // 2. 大屏幕：固定视图
  return (
    <View
      style={{
        width: 280,
        backgroundColor: bgMain,
        borderRightWidth: 1,
        borderColor: borderColor,
        paddingTop: Platform.OS === "ios" ? insets.top : 0,
        height: "100%",
      }}
    >
      <SidebarContent />
    </View>
  );
};