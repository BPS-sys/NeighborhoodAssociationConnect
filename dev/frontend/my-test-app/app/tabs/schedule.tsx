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
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const { width } = Dimensions.get("window");
const CELL_SIZE = (width - 40) / 7;

export default function ScheduleScreen() {
  const router = useRouter();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [eventsByDate, setEventsByDate] = useState<Record<string, { title: string; detail: string; starttime: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { RegionID, userName, regionName } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/regions/${RegionID}/news`);
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
          const key = date.toISOString().split("T")[0];

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
        
        // フェードインアニメーション
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("イベント取得失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [RegionID]);

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

  const makeCells = (year: number, month: number) => {
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < first; i++) arr.push(null);
    for (let d = 1; d <= last; d++) arr.push(d);
    while (arr.length % 7) arr.push(null);
    return arr;
  };

  const getEventCount = (dateKey: string) => {
    return eventsByDate[dateKey]?.length || 0;
  };

  const formatSelectedDate = (dateKey: string) => {
    const date = new Date(dateKey);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ヘッダーグラデーション */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >

        {/* ユーザー情報 */}
        <View style={styles.userInfoContainer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color="#ffffff" />
            <Text style={styles.regionName}>{regionName}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Ionicons name="calendar" size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>スケジュール</Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* カレンダー部分 */}
        <View style={styles.calendarSection}>
          <ScrollView 
            style={styles.calendarWrapper}
            showsVerticalScrollIndicator={false}
          >
            {months.map(({ year, month }) => {
              const cells = makeCells(year, month);
              return (
                <View key={`${year}-${month}`} style={styles.monthContainer}>
                  <View style={styles.monthHeader}>
                    <Text style={styles.monthTitle}>
                      {year}年 {month + 1}月
                    </Text>
                  </View>
                  
                  <View style={styles.weekHeader}>
                    {WEEK_DAYS.map((w, i) => (
                      <View key={i} style={[styles.weekDayContainer, { width: CELL_SIZE }]}>
                        <Text style={[
                          styles.weekDayText,
                          i === 0 && styles.sundayText,
                          i === 6 && styles.saturdayText
                        ]}>
                          {w}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.daysGrid}>
                    {cells.map((d, idx) => {
                      const dateKey = d ? `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}` : null;
                      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                      const eventCount = dateKey ? getEventCount(dateKey) : 0;
                      const isSelected = selectedDate === dateKey;
                      const isWeekend = idx % 7 === 0 || idx % 7 === 6;
                      
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.dayCell,
                            { width: CELL_SIZE, height: CELL_SIZE },
                            isToday && styles.todayCell,
                            isSelected && styles.selectedCell,
                            eventCount > 0 && styles.eventCell,
                          ]}
                          activeOpacity={d ? 0.7 : 1}
                          onPress={() => d && dateKey && setSelectedDate(dateKey)}
                          disabled={!d}
                        >
                          {d && (
                            <>
                              <Text style={[
                                styles.dayText,
                                isToday && styles.todayText,
                                isSelected && styles.selectedText,
                                isWeekend && !isToday && !isSelected && styles.weekendText,
                              ]}>
                                {d}
                              </Text>
                              {eventCount > 0 && (
                                <View style={styles.eventIndicator}>
                                  <Text style={styles.eventCount}>
                                    {eventCount > 9 ? '9+' : eventCount}
                                  </Text>
                                </View>
                              )}
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* イベント詳細部分 */}
        <View style={styles.eventSection}>
          <View style={styles.eventHeader}>
            <Ionicons name="list" size={20} color="#667eea" />
            <Text style={styles.eventHeaderTitle}>
              {selectedDate ? formatSelectedDate(selectedDate) : 'イベント詳細'}
            </Text>
          </View>
          
          <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>イベントを読み込み中...</Text>
              </View>
            ) : selectedDate && eventsByDate[selectedDate] ? (
              eventsByDate[selectedDate].map((ev, i) => (
                <View key={i} style={styles.eventCard}>
                  <View style={styles.eventCardHeader}>
                    <View style={styles.eventTypeChip}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.eventTypeText}>イベント</Text>
                    </View>
                    <Text style={styles.eventTime}>
                      {new Date(ev.starttime).toLocaleTimeString("ja-JP", { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: "Asia/Tokyo" 
                      })}
                    </Text>
                  </View>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  {ev.detail && (
                    <Text style={styles.eventDetail}>{ev.detail}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>イベントがありません</Text>
                <Text style={styles.emptyStateSubtitle}>
                  {selectedDate ? '選択した日にはイベントがありません' : 'カレンダーから日付を選択してください'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  
  // ヘッダー
  headerGradient: {
    // paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  
  accountIcon: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    zIndex: 10,
  },
  accountIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },

  userInfoContainer: { 
    alignItems: "center",
    marginTop: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionName: { 
    fontSize: 16, 
    color: "#ffffff", 
    marginLeft: 4,
    opacity: 0.9,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginLeft: 8,
  },
  userName: { 
    fontSize: 16, 
    color: "#ffffff",
    opacity: 0.9,
  },

  content: {
    flex: 1,
  },
  calendarSection: {
    backgroundColor: "#fff",
    maxHeight: "60%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  calendarWrapper: {
    flexGrow: 0,
    
  },
  monthContainer: {
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  monthHeader: {
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  sundayText: {
    color: "#ef4444",
  },
  saturdayText: {
    color: "#3b82f6",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 4,
    position: "relative",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  todayCell: {
    backgroundColor: "#667eea",
  },
  todayText: {
    color: "#fff",
    fontWeight: "600",
  },
  selectedCell: {
    backgroundColor: "#e0e7ff",
    borderWidth: 2,
    borderColor: "#667eea",
  },
  selectedText: {
    color: "#667eea",
    fontWeight: "600",
  },
  eventCell: {
    backgroundColor: "#fef3c7",
  },
  weekendText: {
    color: "#9ca3af",
  },
  eventIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  eventCount: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  eventSection: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  eventHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  eventList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  eventCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  eventCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#d97706",
    marginLeft: 4,
  },
  eventTime: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
  },
});