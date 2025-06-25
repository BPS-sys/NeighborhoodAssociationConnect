// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case "index":
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              );
            case "board":
              return (
                <MaterialCommunityIcons
                  name={focused ? "clipboard-text" : "clipboard-text-outline"}
                  size={size}
                  color={color}
                />
              );
            case "chat":
              return (
                <Ionicons
                  name={focused ? "chatbubble" : "chatbubble-outline"}
                  size={size}
                  color={color}
                />
              );
            case "schedule":
              return (
                <Ionicons
                  name={focused ? "calendar" : "calendar-outline"}
                  size={size}
                  color={color}
                />
              );
            case "article":
              return (
                <MaterialCommunityIcons
                  name={
                    focused
                      ? "newspaper"
                      : "newspaper-variant-outline"
                  }
                  size={size}
                  color={color}
                />
              );
          }
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { height: 60, paddingBottom: 5 },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "ホーム" }} />
      <Tabs.Screen name="board" options={{ title: "掲示板" }} />
      <Tabs.Screen name="chat" options={{ title: "チャット" }} />
      <Tabs.Screen name="schedule" options={{ title: "スケジュール" }} />
      <Tabs.Screen name="article" options={{ title: "記事" }} />
    </Tabs>
  );
}
