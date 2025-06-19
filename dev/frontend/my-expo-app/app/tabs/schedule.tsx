// app/(tabs)/schedule.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const { width } = Dimensions.get("window");
// 画面幅 - 両端マージン 32px を 7 分割したセルサイズ
const CELL_SIZE = (width - 32) / 7;

export default function ScheduleScreen() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  // ダミーイベント（複数イベント対応）
  const eventsByDate: Record<number, { title: string; detail: string }[]> = {
    3: [
      { title: "ゴミ分別（燃えるゴミ）", detail: "可燃ごみを出してください" },
      { title: "地域清掃", detail: "午前9時 公園集合" },
    ],
    5: [
      { title: "防災訓練", detail: "午前10時 市民センター\nAED・初期消火訓練" },
      { title: "非常食配布", detail: "午後1時～3時 市役所前" },
    ],
    8: [{ title: "資源ごみ分別日", detail: "古紙・缶・瓶・ペットボトル" }],
    12: [{ title: "資源ごみ分別日", detail: "古紙・缶・瓶・ペットボトル" }],
    15: [
      { title: "防犯パトロール", detail: "午後7時 地区公民館集合" },
      { title: "子ども音楽会", detail: "午後2時 市民ホール" },
      { title: "健康ウォーキング", detail: "午前8時 市民公園集合" },
    ],
    20: [
      { title: "地域清掃", detail: "午前9時 公園集合\n軍手・ゴミ袋持参" },
      { title: "町内会会議", detail: "午後2時 集会所" },
      { title: "ヨガ教室", detail: "午後6時 市民ホール" },
    ],
    25: [{ title: "避難所運営訓練", detail: "午前10時 小学校体育館" }],
    28: [
      { title: "資源ごみ分別日", detail: "古紙・缶・瓶・ペットボトル" },
      { title: "こどもフェス", detail: "午後3時 市民広場" },
    ],
  };

  // 今月以降1年間分の (year,month) 配列を生成
  const months = useMemo(() => {
    const arr: { year: number; month: number }[] = [];
    // 当年：今月〜12月
    for (let m = currentMonth; m < 12; m++) {
      arr.push({ year: currentYear, month: m });
    }
    // 次年：1月〜今月-1月
    for (let m = 0; m < currentMonth; m++) {
      arr.push({ year: currentYear + 1, month: m });
    }
    return arr;
  }, [currentYear, currentMonth]);

  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // 指定月のセル配列を作る
  const makeCells = (year: number, month: number) => {
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < first; i++) arr.push(null);
    for (let d = 1; d <= last; d++) arr.push(d);
    while (arr.length % 7) arr.push(null);
    return arr;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 上部：全カレンダー（縦スクロール） */}
      <ScrollView style={styles.calendarWrapper}>
        {months.map(({ year, month }) => {
          const cells = makeCells(year, month);
          return (
            <View key={`${year}-${month}`} style={styles.monthContainer}>
              {/* 月ヘッダー */}
              <Text
                style={[styles.monthHeader, { height: CELL_SIZE * 0.8 }]}
              >
                {year}年 {month + 1}月
              </Text>
              {/* 曜日行 */}
              <View
                style={[styles.weekRow, { height: CELL_SIZE * 0.6 }]}
              >
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
              {/* 日付セル群 */}
              <View style={styles.daysContainer}>
                {cells.map((d, idx) => {
                  const isToday =
                    d === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();
                  const hasEvent = d != null && (eventsByDate[d] || []).length > 0;
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
                      <Text
                        style={[
                          styles.dayText,
                          idx % 7 === 0 && { color: "#d00" },
                        ]}
                      >
                        {d ?? ""}
                      </Text>
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
            </View>
          );
        })}
      </ScrollView>

      {/* 下部：イベントリスト（縦スクロール可） */}
      <View style={styles.eventListContainer}>
        {selectedDate && eventsByDate[selectedDate] ? (
          <ScrollView>
            {eventsByDate[selectedDate].map((ev, i) => (
              <View key={i} style={styles.eventItem}>
                <Text style={styles.eventTitle}>
                  {selectedDate}日: {ev.title}
                </Text>
                <Text style={styles.eventDetail}>{ev.detail}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.eventPlaceholder}>
            星マークの日付をタップしてイベントを確認
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  calendarWrapper: {
    flexGrow: 0,
    maxHeight: Dimensions.get("window").height * 0.6,
    backgroundColor: "#fff",
  },
  monthContainer: {
    marginVertical: 8,
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
  weekDay: { textAlign: "center", fontSize: 12, fontWeight: "600" },
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
    fontSize: CELL_SIZE * 0.3,
    textAlign: "center",
    width: CELL_SIZE,
  },
  todayCell: {
    backgroundColor: "transparent",
    borderColor: "#7fff7f",
    borderWidth: 2,
  },
  selectedCell: { backgroundColor: "#b7ffb7" },
  starIcon: {
    position: "absolute",
    top: "65%",
    left: "50%",
    transform: [
      { translateX: -CELL_SIZE * 0.2 },
      { translateY: -CELL_SIZE * 0.2 },
    ],
  },

  eventListContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopColor: "#ddd",
    borderTopWidth: 0.5,
    marginTop: -8,
  },
  eventItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 0.5,
  },
  eventTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  eventDetail: { fontSize: 14, color: "#555" },
  eventPlaceholder: {
    padding: 12,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
