import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectFile: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onClose,
  onSelectImage,
  onSelectFile,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 背景遮罩：点击关闭 */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* 内容区域：阻止点击冒泡 */}
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <Text style={styles.title}>选择上传内容</Text>
            
            <TouchableOpacity 
              style={styles.option} 
              onPress={() => { onClose(); onSelectImage(); }}
            >
              <Text style={styles.optionText}>图片</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.option} 
              onPress={() => { onClose(); onSelectFile(); }}
            >
              <Text style={styles.optionText}>文件</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={[styles.option, styles.cancelOption]} 
              onPress={onClose}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            
            {/* 底部安全区适配 */}
            <SafeAreaView edges={["bottom"]} />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end", // Web居中，手机底部
    alignItems: "center",
  },
  container: {
    width: Platform.OS === "web" ? 400 : "80%", // Web限制宽度
    backgroundColor:"white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Web 上给四个角都圆角
    borderRadius: Platform.OS === "web" ? 20 : 0, 
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  option: {
    paddingVertical: 15,
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#3b82f6",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  cancelOption: {
    marginTop: 10,
    paddingBottom: Platform.OS === "ios" ? 10 : 20,
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
  },
});