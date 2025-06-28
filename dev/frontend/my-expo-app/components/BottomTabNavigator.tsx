import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

const BottomTabNavigator = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          size = 24;
          
          // アイコンにグラデーション風の背景を追加（フォーカス時）
          const IconWrapper = ({ children }: { children: React.ReactNode }) => (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: focused 
                  ? 'rgba(102, 126, 234, 0.15)' 
                  : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            >
              {children}
            </View>
          );

          switch (route.name) {
            case "index":
              return (
                <IconWrapper>
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={size}
                    color={color}
                  />
                </IconWrapper>
              );
            case "board":
              return (
                <IconWrapper>
                  <MaterialCommunityIcons
                    name={focused ? "clipboard-text" : "clipboard-text-outline"}
                    size={size}
                    color={color}
                  />
                </IconWrapper>
              );
            case "chat":
              return (
                <IconWrapper>
                  <Ionicons
                    name={focused ? "chatbubble" : "chatbubble-outline"}
                    size={size}
                    color={color}
                  />
                </IconWrapper>
              );
            case "schedule":
              return (
                <IconWrapper>
                  <Ionicons
                    name={focused ? "calendar" : "calendar-outline"}
                    size={size}
                    color={color}
                  />
                </IconWrapper>
              );
            case "article":
              return (
                <IconWrapper>
                  <MaterialCommunityIcons
                    name={focused ? "newspaper" : "newspaper-variant-outline"}
                    size={size}
                    color={color}
                  />
                </IconWrapper>
              );
          }
        },
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -5,
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 34 : 20,
          left: 16,
          right: 16,
          elevation: 8,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          height: Platform.OS === "ios" ? 85 : 70,
          paddingBottom: Platform.OS === "ios" ? 25 : 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          // iOS用のblurエフェクト
          ...(Platform.OS === "ios" && {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }),
          // Android用の追加スタイル
          ...(Platform.OS === "android" && {
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          marginHorizontal: 2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "ホーム",
          tabBarAccessibilityLabel: "ホーム画面"
        }} 
      />
      <Tabs.Screen 
        name="board" 
        options={{ 
          title: "掲示板",
          tabBarAccessibilityLabel: "掲示板画面"
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{ 
          title: "チャット",
          tabBarAccessibilityLabel: "チャット画面"
        }} 
      />
      <Tabs.Screen 
        name="schedule" 
        options={{ 
          title: "予定",
          tabBarAccessibilityLabel: "スケジュール画面"
        }} 
      />
      <Tabs.Screen 
        name="article" 
        options={{ 
          title: "記事",
          tabBarAccessibilityLabel: "記事画面"
        }} 
      />
    </Tabs>
  );
};

export default BottomTabNavigator;