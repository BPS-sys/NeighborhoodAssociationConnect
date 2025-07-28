import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";

export default function TabsLayout() {
  const { userRole } = useAuth();
  console.log("TabsLayout userRole:", userRole);

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
                  name={focused ? "bulletin-board" : "bulletin-board"}
                  size={size}
                  color={color}
                />
              );
            case "chat":
              return (
                <Ionicons
                  name={focused ? "chatbubbles" : "chatbubbles-outline"}
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
                  name={focused ? "file-document-edit" : "file-document-edit-outline"}
                  size={size}
                  color={color}
                />
              );
            case "sendmessage":
              return (
                <MaterialIcons
                  name={focused ? "send" : "send"}
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
      <Tabs.Screen name="schedule" options={{ title: "予定" }} />
      <Tabs.Screen
        name="article"
        options={{
          title: "記事投稿",
          href: userRole === "会員" ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="sendmessage"
        options={{
          title: "一斉送信",
          href: userRole === "会員" ? null : undefined,
        }}
      />
    </Tabs>
  );
}


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。