import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'

export function useImageMessage() {
  const [loading, setLoading] = useState(false)

  const pickImage = async () => {
    try {
      setLoading(true)

      // 请求权限
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        alert('需要访问相册权限才能选择图片')
        return null
      }

      // 打开相册
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      })

      if (result.canceled) return null

      const asset = result.assets?.[0]
      if (!asset) return null

      // 构建聊天消息格式
      return {
        id: `i_${Date.now()}`,
        role: 'user',
        type: 'image',
        content: asset.uri,
        width: asset.width,
        height: asset.height,
      }
    } catch (err) {
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    pickImage,
    loading,
  }
}