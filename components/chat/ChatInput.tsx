// ChatInput.tsx
import React, { useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  Image,
  Platform,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "@/global.css";

// 假设您有一个文件信息类型
// 如果您使用 Expo/react-native-document-picker，它返回的可能是这样的结构
interface PendingFile {
  uri: string;
  name: string; // 文件名
  mimeType: string; // MIME 类型
  size: number;
}

interface ChatInputProps {
  input: string;
  setInput: (text: string) => void;
  pendingImages: string[];
  setPendingImages: (uris: string[]) => void;
  // ⭐ 新增: 待发送的文件列表
  pendingFiles: PendingFile[];
  setPendingFiles: (files: PendingFile[]) => void;
  onSend: () => void;
  // ⭐ 修改: onUpload 现在可以处理图片或文件选择
  onUpload: () => void; 
  theme: "dark" | "light";
  streaming: boolean;
}

// Icon 组件（用于关闭按钮，使用 Text 代替）
const CloseIcon = ({ color, size }: { color: string, size: number }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: size * 0.8, lineHeight: size * 0.8 }}>×</Text>
  </View>
);

// ⭐ 新增: 文件图标组件（用简单的 Text 代替）
const FileIcon = ({ color, size }: { color: string, size: number }) => (
  <View className="w-full h-full bg-indigo-200 justify-center items-center rounded-lg p-1">
    <Text style={{ color: 'rgb(30 58 138)', fontSize: size * 0.3, fontWeight: 'bold' }}>FILE</Text>
    <Text numberOfLines={1} style={{ color: 'rgb(55 65 81)', fontSize: size * 0.15 }}>...</Text>
  </View>
);


export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  pendingImages,
  setPendingImages,
  pendingFiles, // ⭐ 新增
  setPendingFiles, // ⭐ 新增
  onSend,
  onUpload,
  theme,
  streaming,
}) => {
  const textInputRef = useRef<TextInput>(null);
  
  // 合并图片和文件列表，用于判断是否需要展示预览区
  const hasAttachments = pendingImages.length > 0 || pendingFiles.length > 0;
  // 合并图片和文件数量
  const totalAttachments = pendingImages.length + pendingFiles.length;

  useEffect(() => {
    // 当附件列表变化时，重新聚焦输入框（非 Web 平台）
    if (Platform.OS !== 'web') {
      textInputRef.current?.focus();
    }
  }, [pendingImages, pendingFiles]); // ⭐ 添加 pendingFiles 依赖

  const handleSend = () => {
    // ⭐ 更新发送条件：只要有文字、图片或文件中的任意一个，就可以发送
    if (!streaming && (input.trim() || hasAttachments)) {
      onSend();
      if (Platform.OS !== 'web') {
        textInputRef.current?.focus();
      }
    }
  }

  const removeImage = (uriToRemove: string) => {
    setPendingImages(pendingImages.filter(uri => uri !== uriToRemove));
  };
  
  // ⭐ 新增: 移除文件逻辑
  const removeFile = (uriToRemove: string) => {
    setPendingFiles(pendingFiles.filter(file => file.uri !== uriToRemove));
  };

  const inputBg = theme === "dark" ? "bg-gray-200" : "bg-gray-100";
  const footerBg = theme === "dark" ? "bg-gray-950" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-800" : "border-gray-300";
  // ⭐ 更新禁用条件
  const sendDisabled = streaming || (!input.trim() && !hasAttachments); 

  // 确保 Android 文本输入能从顶部开始
  const androidStyle = {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 2, 
  };
  
  // ⭐ 整合图片和文件数据，用于 FlatList 渲染
  const allAttachments: (string | PendingFile)[] = [
    ...pendingImages, 
    ...pendingFiles
  ];
  
  // ⭐ 新增: 渲染单个附件项的函数
  const renderAttachmentItem = ({ item }: { item: string | PendingFile }) => {
    const isImage = typeof item === 'string';
    const uri = isImage ? item : (item as PendingFile).uri;
    const name = isImage ? '' : (item as PendingFile).name;

    const handleRemove = () => {
      isImage ? removeImage(uri) : removeFile(uri);
    };

    return (
      <View className="mr-3 relative">
        <View className="w-20 h-20 rounded-lg overflow-hidden">
          {isImage ? (
            <Image source={{ uri }} className="w-full h-full" />
          ) : (
            // ⭐ 文件预览 UI
            <View className="flex-1 border border-gray-400 bg-gray-100 justify-center items-center p-1">
              <FileIcon color="#fff" size={40} />
              <Text numberOfLines={1} className="text-xs text-gray-700 mt-1 w-full text-center">{name}</Text>
            </View>
          )}
        </View>
        
        {/* 关闭按钮 */}
        <Pressable
          onPress={handleRemove}
          className="absolute -top-2 -right-2 bg-gray-700 w-6 h-6 rounded-full flex justify-center items-center p-1"
        >
          <Text className="text-white text-base font-bold">×</Text>
        </Pressable>
      </View>
    );
  };
  
  return (
    <View className={`px-3 py-2 border-t ${borderColor} ${footerBg}`}>

      {/* 1. 附件预览区域 (FlatList) */}
      {hasAttachments && ( // ⭐ 检查是否有附件
        <View className="mb-2">
          <FlatList
            horizontal
            // ⭐ 使用整合后的 allAttachments
            data={allAttachments}
            keyExtractor={(item) => typeof item === 'string' ? item : item.uri}
            showsHorizontalScrollIndicator={false}
            className="p-2"
            // ⭐ 使用统一的渲染函数
            renderItem={renderAttachmentItem}
          />
        </View>
      )}

      {/* 2. 输入框和按钮区域 */}
      <View className="flex-row items-end">

        {/* 上传按钮 (功能不变，但现在它会在外部逻辑中处理文件和图片) */}
        <Pressable
          onPress={onUpload}
          className="mr-2 mb-1 justify-center items-center w-10 h-10 bg-indigo-600 rounded-full"
        >
          {/* ⭐ 更改图标，使其更具“文件/上传”通用性 */}
          <Text className="text-white text-xl font-bold">+</Text>
        </Pressable>

        {/* 输入框 */}
        <TextInput
          ref={textInputRef}
          value={input}
          onChangeText={setInput}
          // ⭐ 更新 placeholder 提示
          placeholder={totalAttachments > 0 ? `添加文字描述 (共${totalAttachments}个附件)...` : "发送消息..."}
          placeholderTextColor="#888"
          className={`flex-1 rounded-full pl-5 pt-3 ${inputBg} text-black text-base h-4/5 custom-scrollbar`}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          textAlignVertical="top" 
          style={Platform.OS === 'android' ? androidStyle : undefined}
        />

        {/* 发送按钮 */}
        <Pressable
          onPress={handleSend}
          className={`ml-2 mb-1 px-4 py-2 rounded-xl flex justify-center items-center ${sendDisabled ? "bg-gray-400" : "bg-indigo-600"}`}
          disabled={sendDisabled}
        >
          <Text className="text-white text-base">{streaming ? "中..." : "发送"}</Text>
        </Pressable>
      </View>
    </View>
  );
};