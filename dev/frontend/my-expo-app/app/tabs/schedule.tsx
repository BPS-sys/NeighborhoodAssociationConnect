// app/(tabs)/schedule.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];
const { width } = Dimensions.get("window");
// セルサイズ計算
const CELL_SIZE = (width - 16 - 12) / 7;
// レンダリング年レンジ後は不要
// 今月以降のみ表示

export default function ScheduleScreen() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

  // 今月以降の (year, month) を生成
  const months = useMemo(() => {
    const arr: { year: number; month: number }[] = [];
    // 当年
    for (let m = currentMonth; m < 12; m++) {
      arr.push({ year: currentYear, month: m });
    }
    // 次年以降を例として1年分
    for (let m = 0; m < 12; m++) {
      arr.push({ year: currentYear + 1, month: m });
    }
    return arr;
  }, [currentYear, currentMonth]);

  const renderMonth = (year: number, month: number) => {
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= last; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);

    return (
      <View key={`${year}-${month}`} style={styles.monthContainer}>
        <Text style={styles.monthHeader}>{year}年 {month + 1}月</Text>
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((w,i) => (
            <Text
              key={i}
              style={[styles.weekDay, i===0&&{color:'#d00'}]}
            >{w}</Text>
          ))}
        </View>
        <View style={styles.daysContainer}>
          {cells.map((d,idx) => {
            const isToday =
              d=== today.getDate() &&
              month===today.getMonth() &&
              year===today.getFullYear();
            return (
              <View
                key={idx}
                style={[styles.dayCell, isToday&&styles.todayCell]}
              >
                <Text style={[styles.dayText, idx%7===0&&{color:'#d00'}]}>
                  {d??""}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {months.map(({year,month})=>renderMonth(year,month))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical:8, backgroundColor:'#f5f5f5', alignItems:'center' },
  monthContainer: { width: width-16, backgroundColor:'#fff', marginBottom:16, borderRadius:4, overflow:'hidden' },
  monthHeader: { backgroundColor:'#eaeaea', textAlign:'center', paddingVertical:4, fontSize:14, fontWeight:'bold' },
  weekRow: { flexDirection:'row', backgroundColor:'#fafafa' },
  weekDay:{ width:CELL_SIZE, textAlign:'center', fontSize:10, paddingVertical:2, fontWeight:'600' },
  daysContainer:{ flexDirection:'row', flexWrap:'wrap' },
  dayCell:{ width:CELL_SIZE, height:CELL_SIZE, alignItems:'center', justifyContent:'center', margin:1 },
  dayText:{ fontSize:10, color:'#333' },
  todayCell:{ borderColor:'#007AFF', borderWidth:1, borderRadius:CELL_SIZE/2 },
});