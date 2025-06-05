// app/(tabs)/index.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  // --- ダミーデータ ---
  const userName = "山田 太郎";
  const staffId = "館員番号：A12345";

  // 掲示板の各カテゴリの「未読・新着件数」を想定
  const boardUpdates = {
    crime: 0,     // 防犯の未読件数
    event: 2,     // イベントの未読件数
    disaster: 0,  // 防災の未読件数
  };

  // 「未読や新着」があるカテゴリ名の配列を作成
  const hasNewCategories = Object.entries(boardUpdates)
    .filter(([, count]) => count > 0)
    .map(([key]) => {
      switch (key) {
        case "crime":
          return "防犯";
        case "event":
          return "イベント";
        case "disaster":
          return "防災";
        default:
          return "";
      }
    });

  // 直近イベント（今回は仮：ゴミ出し日）
  const nextEvent = {
    title: "資源ごみの日",
    date: "2025/06/01（火）",
    hasNew: true,
  };

  // 新着掲示板アイテムをタップしたとき
  const onPressBoardUpdate = () => {
    // 未読件数があるなら掲示板画面へ
    if (hasNewCategories.length > 0) {
      router.push("/board");
    } else {
      Alert.alert("新着情報がありません");
    }
  };

  // 直近イベントカードをタップしたとき
  const onPressEvent = () => {
    // 今回は常に掲示板画面へ遷移
    router.push("/board");
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "ホーム" }} />

      {/* ① 画面上部：ユーザー情報 */}
      <View style={[styles.section, styles.userInfoContainer]}>
        <Text style={styles.welcomeText}>ようこそ、</Text>
        <Text style={styles.userName}>{userName} さん</Text>
        <Text style={styles.staffId}>{staffId}</Text>
      </View>

      {/* ② 中部：掲示板の更新情報 */}
      <TouchableOpacity
        style={[styles.section, styles.boardContainer]}
        activeOpacity={hasNewCategories.length > 0 ? 0.7 : 1}
        onPress={onPressBoardUpdate}
      >
        <Text style={styles.sectionTitle}>掲示板の更新情報</Text>

        {hasNewCategories.length === 0 ? (
          <Text style={styles.noUpdatesText}>新たな情報はございません</Text>
        ) : (
          hasNewCategories.map((category) => (
            <View key={category} style={styles.updateItem}>
              <Text style={styles.updateCategory}>{category}</Text>
              <Text style={styles.updateBadge}>
                {boardUpdates[
                  category === "防犯"
                    ? "crime"
                    : category === "イベント"
                    ? "event"
                    : "disaster"
                ]}
                件の新着
              </Text>
            </View>
          ))
        )}
      </TouchableOpacity>

      {/* ③ 下部：直近イベント情報 */}
      <TouchableOpacity
        style={[styles.section, styles.eventContainer]}
        activeOpacity={nextEvent.hasNew ? 0.7 : 1}
        onPress={onPressEvent}
      >
        <Text style={styles.sectionTitle}>直近のイベント</Text>
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{nextEvent.title}</Text>
          <Text style={styles.eventDate}>{nextEvent.date}</Text>
          {nextEvent.hasNew && (
            <Text style={styles.newEventBadge}>新着</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    flexDirection: "column",
  },
  section: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },

  // ① ユーザー情報
  userInfoContainer: {
    alignItems: "center",
    borderBottomWidth: 0,
  },
  welcomeText: {
    fontSize: 16,
    color: "#555",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  staffId: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  // ② 掲示板更新情報
  boardContainer: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  noUpdatesText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 8,
  },
  updateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomColor: "#ececec",
    borderBottomWidth: 1,
  },
  updateCategory: {
    fontSize: 16,
    color: "#333",
  },
  updateBadge: {
    fontSize: 14,
    color: "#d32f2f",
  },

  // ③ 直近イベント
  eventContainer: {
    borderBottomWidth: 0,
  },
  eventCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#333",
  },
  newEventBadge: {
    marginTop: 6,
    color: "#fff",
    backgroundColor: "#d32f2f",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
});
