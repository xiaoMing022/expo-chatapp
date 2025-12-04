//负责处理附件（图片、文件）的选择和状态。
import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { PendingFile } from "@/types/types"; // 假设你的类型定义在这里

export const useAttachments = () => {
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  // 选择图片
  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) {
      Alert.alert("权限不足", "需要图库权限以选择图片");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map((asset) => asset.uri);
      setPendingImages((prev) => [...prev, ...newUris]);
      return true; // 返回 true 表示有新增内容，便于 UI 触发滚动
    }
    return false;
  };

  // 选择文件
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || "application/octet-stream",
          size: asset.size || 0,
        }));
        setPendingFiles((prev) => [...prev, ...newFiles]);
        return true;
      }
    } catch (error) {
      console.error("文件选择失败:", error);
      Alert.alert("错误", "文件选择失败，请重试。");
    }
    return false;
  };

  // 清空所有附件
  const clearAttachments = () => {
    setPendingImages([]);
    setPendingFiles([]);
  };

  return {
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    pickImage,
    pickDocument,
    clearAttachments,
  };
};