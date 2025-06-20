// app/tabs/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "ホーム" }} />
      <Tabs.Screen name="board" options={{ title: "掲示板" }} />
      <Tabs.Screen name="chat" options={{ title: "チャット" }} />
      <Tabs.Screen name="schedule" options={{ title: "スケジュール" }} />
    </Tabs>
  );
}
