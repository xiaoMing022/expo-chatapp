import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 引入安全区域钩子

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 推荐：使用 Lucide 图标库 (样式更现代，与你之前的 Drawer 统一)
// 确保安装了: npm install lucide-react-native
import { House, User } from 'lucide-react-native';

// 如果你想用原来的 IconSymbol，可以取消注释下面的引用并替换使用
// import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // 获取安全区域插边（特别是底部的小黑条区域）
  const insets = useSafeAreaInsets();

  // 定义颜色
  const activeColor = '#4f46e5';
  const inactiveColor = isDark ? '#8E8E93' : '#999999'; // 经典的非选中灰色
  const backgroundColor = isDark ? '#121212' : '#ffffff'; // 纯净背景

  return (
    <Tabs
      screenOptions={{
        // --- 1. 基础设置 ---
        headerShown: false,
        tabBarButton: HapticTab, // 保持你的触觉反馈组件
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        
        // --- 2. 隐藏默认的 Tab 标签 (可选) ---
        // 如果你希望类似 Instagram 那样只显示图标，设为 false。
        // 这里我们保留标签，但把字体设小一点更精致。
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 4, // 调整文字和底部的距离
        },

        // --- 3. 核心：美化 TabBar 容器 ---
        tabBarStyle: {
          // (可选) 如果想要背景模糊效果，可以用 absolute
          backgroundColor: backgroundColor,
          borderTopWidth: 0, // 关键：去除默认的顶部丑陋边框线
          
          // 动态高度：基础高度 60 + 底部安全区
          height: 60 + insets.bottom, 
          
          // 内边距：确保图标不会贴底
          paddingBottom: insets.bottom,
          paddingTop: 8,

          // 阴影效果 (iOS)
          shadowColor: isDark ? '#000' : '#ccc',
          shadowOffset: {
            width: 0,
            height: -2, // 阴影向上投射
          },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 10,
          
          // 阴影效果 (Android)
          elevation: 5,
        },
      }}
    >
      {/* --- 主页 Tab --- */}
      <Tabs.Screen
        name="home/index"
        options={{
          title: '主页',
          tabBarIcon: ({ color, focused }) => (
            // 使用 Lucide 图标，根据 focused 状态改变大小或粗细
            <House 
              size={26} 
              color={color} 
              // 选中时线条加粗，或者填充颜色(如果图标支持)
              strokeWidth={focused ? 2.5 : 2} 
            />
            
            // 旧版写法备份:
            // <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* --- 个人中心 Tab --- */}
      <Tabs.Screen
        name="about/index"
        options={{
          title: '我的', // "我" 改为 "我的" 通常更顺口
          tabBarIcon: ({ color, focused }) => (
            // 这里换成了 User 图标，区分于主页
            <User 
              size={26} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
            
            // 旧版写法备份 (注意 icon name 应该改一下，别两个都是 house):
            // <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}