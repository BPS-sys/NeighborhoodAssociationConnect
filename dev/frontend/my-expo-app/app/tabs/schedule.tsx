import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 32) / 7;

export default function ScheduleScreen() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  const [eventsByDate, setEventsByDate] = useState<Record<number, { title: string; detail: string; starttime: string }[]>>({});
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/regions/ugyGiVvlg4fDN2afMnoe(RegionID)/news");
        const data = await res.json();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const filtered = data.filter((item: any) => {
          if (item.columns !== "イベント" || !item.starttime) return false;
          const startDate = new Date(item.starttime);
          return startDate >= startOfMonth;
        });


        const byDate: Record<string, { title: string; detail: string; starttime: string }[]> = {};
          for (const item of filtered) {
            const date = new Date(item.starttime);
            const key = date.toISOString().split("T")[0]; // yyyy-MM-dd

            if (!byDate[key]) {
              byDate[key] = [];
            }

            byDate[key].push({
              title: item.title ?? "イベント",
              detail: item.body ?? "",
              starttime: item.starttime,
            });
          }
          setEventsByDate(byDate);
      } catch (err) {
        console.error("イベント取得失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const months = useMemo(() => {
    const arr: { year: number; month: number }[] = [];
    for (let m = currentMonth; m < 12; m++) {
      arr.push({ year: currentYear, month: m });
    }
    for (let m = 0; m < currentMonth; m++) {
      arr.push({ year: currentYear + 1, month: m });
    }
    return arr;
  }, [currentYear, currentMonth]);

  const [selectedDate, setSelectedDate] = useState<number | null>(null);

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
      <ScrollView style={styles.calendarWrapper}>
        {months.map(({ year, month }) => {
          const cells = makeCells(year, month);
          return (
            <View key={`${year}-${month}`} style={styles.monthContainer}>
              <Text style={[styles.monthHeader, { height: CELL_SIZE * 0.8 }]}>
                {year}年 {month + 1}月
              </Text>
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
              <View style={styles.daysContainer}>
                {cells.map((d, idx) => {
                  const isToday =
                    d === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();
                  const hasEvent = d != null && eventsByDate[`${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`];
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
                      onPress={() => d && setSelectedDate(`${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`)}
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

      <View style={styles.eventListContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#888" style={{ marginTop: 20 }} />
        ) : selectedDate && eventsByDate[selectedDate] ? (
          <ScrollView>
            {eventsByDate[selectedDate].map((ev, i) => (
            <View key={i} style={styles.eventItem}>
              <Text style={styles.eventTitle}>
                {ev.title}
              </Text>
              <Text style={styles.eventDetail}>{ev.detail}</Text>
              <Text style={styles.eventTime}>
                開始日時: {new Date(ev.starttime).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </Text>
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

  eventTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

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
