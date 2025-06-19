// app/(tabs)/schedule.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const { width } = Dimensions.get("window");
// 画面幅 - 32px マージン を 7 分割
const CELL_SIZE = (width - 32) / 7;

export default function ScheduleScreen() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11

  // ダミーイベントデータ（日付→タイトル）
  const events: Record<number, string> = {
    5: "定例会議",
    12: "プロジェクト締切",
    20: "チームランチ",
  };

  // カレンダー用セル配列
  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) arr.push(null);
    for (let d = 1; d <= lastDate; d++) arr.push(d);
    while (arr.length % 7) arr.push(null);
    return arr;
  }, [year, month]);

  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 月ヘッダー */}
      <Text style={[styles.monthHeader, { height: CELL_SIZE * 0.8 }]}>
        {year}年 {month + 1}月
      </Text>

      {/* 曜日行 */}
      <View style={[styles.weekRow, { height: CELL_SIZE * 0.6 }]}>
        {WEEK_DAYS.map((w, i) => (
          <Text
            key={i}
            style={[
              styles.weekDay,
              { width: CELL_SIZE, lineHeight: CELL_SIZE * 0.6 },
              i === 0 && { color: "#d00" },
            ]}
          >
            {w}
          </Text>
        ))}
      </View>

      {/* 日付セル */}
      <View style={styles.daysContainer}>
        {cells.map((d, idx) => {
          const isToday =
            d === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const hasEvent = d != null && d in events;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayCell,
                { width: CELL_SIZE, height: CELL_SIZE },
                isToday && styles.todayCell,
                selectedDate === d && styles.selectedCell,
              ]}
              activeOpacity={d ? 0.6 : 1}
              onPress={() => d && setSelectedDate(d)}
            >
              {/* 日付 */}
              <Text
                style={[
                  styles.dayText,
                  idx % 7 === 0 && { color: "#d00" },
                ]}
              >
                {d ?? ""}
              </Text>
              {/* ★マーク */}
              {hasEvent && (
                <Ionicons
                  name="star"
                  size={CELL_SIZE * 0.4}
                  color="#fbc02d"
                  style={styles.starIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 選択イベント表示 */}
      <View style={styles.eventListContainer}>
        {selectedDate && events[selectedDate] ? (
          <Text style={styles.eventText}>
            {selectedDate}日: {events[selectedDate]}
          </Text>
        ) : (
          <Text style={styles.eventText}>日付を選択してください</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  monthHeader: {
    backgroundColor: "#eaeaea",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    textAlignVertical: "center",
    width: width - 32,
  },
  weekRow: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    width: width - 32,
  },
  weekDay: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: width - 32,
  },
  dayCell: {
    borderWidth: 0.5,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
    position: "relative",
  },
  dayText: {
    fontSize:  twelve,
    color: "#333",
  },
  todayCell: {
    backgroundColor: "#b3e5fc",
    borderColor: "#81d4fa",
  },
  selectedCell: {
    backgroundColor: "#d0e8ff",
  },
  starIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -CELL_SIZE * 0.2 }, { translateY: -CELL_SIZE * 0.2 }],
  },
  eventListContainer: {
    width: width - 32,
    minHeight: 40,
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
    borderColor: "#ddd",
    borderWidth: 0.5,
  },
  eventText: {
    fontSize: 14,
    color: "#333",
  },
});
