// app/(tabs)/index.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  FlatList,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const MODAL_MAX_HEIGHT = height * 0.6;

export default function HomeScreen() {
  const router = useRouter();

  // --- ダミーデータ ---
  const userName = "山田 太郎";
  const staffId = "館員番号：A12345";

  const noticesData = [
    {
      id: "1",
      title: "明日水道管の工事をします",
      date: "2025-06-06",
      detail:
        "【詳細情報】\n\n" +
        "・工事日時：2025/06/06（金） 午前9時～午後5時\n" +
        "・作業内容：本町一丁目～三丁目の水道管更新工事\n" +
        "・影響範囲：該当地域は断水の可能性あり。近隣住民の皆様は水の貯め置きをお願いします。\n" +
        "・緊急度：★★★★\n" +
        "・担当部署：水道局工事課\n\n" +
        "ご不便をおかけしますが、ご協力をお願いいたします。",
      isEmergency: true,
    },
    {
      id: "2",
      title: "防災訓練を近日開催します",
      date: "2025-06-08",
      detail:
        "【詳細情報】\n\n" +
        "・訓練日時：2025/06/08（日） 午前10時～12時\n" +
        "・集合場所：市民センター広場\n" +
        "・内容：避難経路確認、AED使用訓練、初期消火訓練\n" +
        "・緊急度：★★★\n" +
        "・主催：防災対策本部\n\n" +
        "ご家庭ごとの避難袋の確認も併せてお願いいたします。",
      isEmergency: false,
    },
    {
      id: "3",
      title: "台風接近のため避難準備をしてください",
      date: "2025-06-04",
      detail:
        "【詳細情報】\n\n" +
        "・警報レベル：警戒レベル3（避難準備）\n" +
        "・避難場所：〇〇小学校体育館\n" +
        "・注意点：停電や断水の可能性あり。懐中電灯・飲料水・非常食を準備してください。\n\n" +
        "台風情報に注意し、安全確保を最優先で行ってください。",
      isEmergency: true,
    },
    {
      id: "4",
      title: "今週末に道路舗装工事があります",
      date: "2025-06-07",
      detail:
        "【詳細情報】\n\n" +
        "・工事日時：2025/06/07（土） 午前8時～午後6時\n" +
        "・場所：中央通り（市役所前～駅前商店街）\n" +
        "・通行制限：一部車線規制あり。迂回路をご利用ください。\n\n" +
        "ご迷惑をおかけしますが、ご協力をお願いいたします。",
      isEmergency: false,
    },
    {
      id: "5",
      title: "公民館会議室の配膳設備点検を行います",
      date: "2025-06-05",
      detail:
        "【詳細情報】\n\n" +
        "・点検日時：2025/06/05（木） 午前9時～午後3時\n" +
        "・影響範囲：公民館会議室は終日使用不可\n" +
        "・担当部署：公民館管理課\n\n" +
        "ご利用の皆様にはご不便をおかけしますが、ご了承ください。",
      isEmergency: false,
    },
  ];
  const notices = useMemo(
    () =>
      [...noticesData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    []
  );
  const [seenNotices, setSeenNotices] = useState<string[]>([]);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<typeof notices[0] | null>(
    null
  );

  const openNoticeModal = (notice: typeof notices[0]) => {
    setSelectedNotice(notice);
    setSeenNotices((prev) =>
      prev.includes(notice.id) ? prev : [...prev, notice.id]
    );
    setNoticeModalVisible(true);
  };
  const closeNoticeModal = () => setNoticeModalVisible(false);

  const upcomingEvents = [
    {
      id: "e1",
      title: "地域健康ウォーキング",
      date: "2025/05/31 (土)",
      detail:
        "【詳細情報】\n\n" +
        "地域住民の健康増進を目的としたウォーキングです。\n" +
        "集合　：市民公園入口\n" +
        "時間　：2025/05/31（土）午前8時～10時\n" +
        "持ち物：運動靴、飲み物、帽子\n\n" +
        "参加無料。どなたでもご自由にご参加ください。",
    },
    {
      id: "e2",
      title: "子どもミュージックフェス",
      date: "2025/06/01 (日)",
      detail:
        "【詳細情報】\n\n" +
        "地域の子どもたちが演奏を披露する音楽イベントです。\n" +
        "場所　：市民ホール大ホール\n" +
        "時間　：2025/06/01（日）午後1時～午後4時\n" +
        "出演　：小学～中学生の音楽クラブ\n\n" +
        "入場無料。皆様のお越しをお待ちしています。",
    },
    {
      id: "e3",
      title: "地域清掃活動",
      date: "2025/06/02 (月)",
      detail:
        "【詳細情報】\n\n" +
        "地域の公園周辺を清掃します。\n" +
        "集合　：〇〇公園正門前\n" +
        "時間　：2025/06/02（月）午前9時～午前11時\n" +
        "持ち物：手袋、ゴミ袋（あれば）\n\n" +
        "ご協力いただける方はぜひご参加ください。",
    },
    {
      id: "e4",
      title: "図書館読書会",
      date: "2025/06/03 (火)",
      detail:
        "【詳細情報】\n\n" +
        "図書館司書と一緒に作品を読み解く読書会です。\n" +
        "場所　：中央図書館会議室\n" +
        "時間　：2025/06/03（火）午後2時～午後3時\n" +
        "テーマ：「世界の童話」\n\n" +
        "参加無料。要予約（電話または図書館カウンター）。",
    },
    {
      id: "e5",
      title: "公園でヨガ教室",
      date: "2025/06/04 (水)",
      detail:
        "【詳細情報】\n\n" +
        "初心者向けヨガ教室を開催します。\n" +
        "場所　：〇〇公園グリーン広場\n" +
        "時間　：2025/06/04（水）午前10時～午前11時\n" +
        "持ち物：ヨガマット、飲み物\n\n" +
        "参加無料。動きやすい服装でお越しください。",
    },
  ];
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(
    null
  );

  const openEventModal = (evt: typeof upcomingEvents[0]) => {
    setSelectedEvent(evt);
    setEventModalVisible(true);
  };
  const closeEventModal = () => setEventModalVisible(false);

  return (
    <View style={styles.root}>
      {/* アカウントアイコン */}
      <TouchableOpacity style={styles.accountIcon}>
        <Ionicons name="person-circle-outline" size={32} color="#333" />
      </TouchableOpacity>

      <Stack.Screen options={{ title: "ホーム" }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* バナー */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: "https://via.placeholder.com/400x120.png?text=防災・防犯・イベント",
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* ユーザー情報 */}
        <View style={[styles.section, styles.userInfoContainer]}>
          <Ionicons name="home-outline" size={24} color="#007AFF" />
          <Text style={styles.userName}>{userName} さん</Text>
          <Text style={styles.staffId}>{staffId}</Text>
        </View>

        {/* 連絡事項 */}
        <View style={[styles.section, styles.noticeContainer]}>
          <Text style={styles.noticeHeading}>連絡事項</Text>
          <FlatList
            data={notices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.noticeItem,
                  seenNotices.includes(item.id) && styles.noticeItemSeen,
                ]}
                activeOpacity={0.7}
                onPress={() => openNoticeModal(item)}
              >
                <View style={styles.noticeRow}>
                  <View
                    style={[
                      styles.badgeCircle,
                      item.isEmergency && styles.badgeCircleEmergency,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle"
                      size={16}
                      color={item.isEmergency ? "#D32F2F" : "transparent"}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        !item.isEmergency && styles.badgeTextHidden,
                      ]}
                    >
                      重要！！
                    </Text>
                  </View>
                  <View style={styles.noticeTextContainer}>
                    <Text style={styles.noticeTitle}>{item.title}</Text>
                    <Text style={styles.noticeDate}>
                      {item.date.replace(/-/g, "/")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.noticeList}
          />
        </View>

        {/* 今週イベント */}
        <View style={[styles.section, styles.eventsContainer]}>
          <Text style={styles.sectionTitle}>今週イベント</Text>
          <FlatList
            data={upcomingEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventCard}
                activeOpacity={0.7}
                onPress={() => openEventModal(item)}
              >
                <View style={styles.eventIcon}>
                  <Ionicons name="calendar-outline" size={20} color="#1565C0" />
                </View>
                <View style={styles.eventTextContainer}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDate}>{item.date}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.eventList}
          />
        </View>
      </ScrollView>

      {/* 連絡事項モーダル */}
      <Modal
        animationType="slide"
        transparent
        visible={noticeModalVisible}
        onRequestClose={closeNoticeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>
                {selectedNotice?.isEmergency && "重要！！ "}
                {selectedNotice?.title}（{selectedNotice?.date.replace(/-/g,"/")}）
              </Text>
              <Text style={styles.modalBody}>{selectedNotice?.detail}</Text>
            </ScrollView>
            <Pressable style={styles.modalButton} onPress={closeNoticeModal}>
              <Text style={styles.modalButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* イベントモーダル */}
      <Modal
        animationType="slide"
        transparent
        visible={eventModalVisible}
        onRequestClose={closeEventModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>
                {selectedEvent?.title}（{selectedEvent?.date}）
              </Text>
              <Text style={styles.modalBody}>{selectedEvent?.detail}</Text>
            </ScrollView>
            <Pressable
              style={[styles.modalButton, styles.scheduleButton]}
              onPress={() => {
                closeEventModal();
                router.push("/schedule");
              }}
            >
              <Text style={styles.modalButtonText}>スケジュール画面へ</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={closeEventModal}>
              <Text style={styles.modalButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { paddingBottom: 24 },

  bannerContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  bannerImage: {
    width: width * 0.9,
    height: 120,
    borderRadius: 8,
  },

  section: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  userInfoContainer: { alignItems: "center" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#333", marginTop: 4 },
  staffId: { fontSize: 14, color: "#777", marginTop: 2 },

  noticeContainer: { marginTop: 8 },
  noticeHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  noticeList: { paddingBottom: 8 },
  noticeItem: {
    marginBottom: 12,
    backgroundColor: "#E6FFE6",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noticeItemSeen: { backgroundColor: "#e0e0e0" },
  noticeRow: { flexDirection: "row", alignItems: "center" },
  badgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCircleEmergency: {
    backgroundColor: "#ffe5e5",
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  badgeText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 10,
    position: "absolute",
    top: -4,
  },
  badgeTextHidden: { opacity: 0 },
  noticeTextContainer: { flex: 1 },
  noticeTitle: { fontSize: 16, color: "#333", fontWeight: "bold" },
  noticeDate: { fontSize: 12, color: "#555", marginTop: 4 },

  eventsContainer: { marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  eventList: { paddingBottom: 16 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventIcon: { marginRight: 12 },
  eventTextContainer: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#1565C0", marginBottom: 4 },
  eventDate: { fontSize: 14, color: "#333" },

  accountIcon: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 16,
    zIndex: 10,
  },

  // モーダル共通
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: MODAL_MAX_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalScrollView: { flexGrow: 0 },
  modalScrollContent: { padding: 20 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalBody: { fontSize: 14, lineHeight: 20 },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontSize: 16 },
  scheduleButton: { backgroundColor: "#28A745" },
});
