// app/(tabs)/index.tsx
import React, { useState, useMemo, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from '../../contexts/AuthContext';
import { RefreshControl } from "react-native";


const { width, height } = Dimensions.get("window");
const MODAL_MAX_HEIGHT = height * 0.6;


type Notice = {
  id: string;
  title: string;
  date: string; // yyyy-MM-dd
  detail: string;
  isEmergency: boolean;
  read: boolean;
};


function convertMessagesToNotices(messages: any[]): Notice[] {
  return messages.map((msg) => {
    const sentDate = new Date(msg.Senttime);
    const formattedDate = sentDate.toISOString().split("T")[0]; // yyyy-MM-dd形式

    return {
      id: msg.id,
      title: msg.Title || "（タイトルなし）",
      date: formattedDate,
      detail: `【詳細情報】\n\n${msg.Text || "詳細情報なし"}`,
      isEmergency: /緊急|重要|避難|災害|台風/.test(msg.Text || ""), // 例: 緊急ワード含んでるかで判定
      read: msg.read
    };
  });
}




export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loadingFetchUserInfo, setLoadingFetchUserInfo] = useState(true);
  const [loadingFetchUserMessage, setLoadingFetchUserMessage] = useState(true);
  const [loadingFetchPosts, setLoadingFetchPosts] = useState(true);
  const [noticesData, setNoticesData] = useState<Notice[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<{
  id: string;
  title: string;
  date: string;
  detail: string;
  }[]>([]);
  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/user/${userId}/info`);
      const data = await res.json();
      setUserName(data.name);
    } catch (err) {
      console.error("ユーザー情報の取得に失敗しました", err);
    } finally {
      setLoadingFetchUserInfo(false);
    }
  };

  const fetchUserMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/users/messages?user_id=${userId}`);
      const messages = await res.json();
      const convedMessages = convertMessagesToNotices(messages);
      setNoticesData(convedMessages);
    } catch (err) {
      console.error("ユーザーメッセージの取得に失敗しました", err);
    } finally {
      setLoadingFetchUserMessage(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/regions/ugyGiVvlg4fDN2afMnoe(RegionID)/news");
      const data = await res.json();

      const now = new Date();
      const filtered = data.filter((item: any) => {
        if (item.columns !== "イベント" || !item.starttime) return false;
        const startDate = new Date(item.starttime);
        return startDate.getTime() > now.getTime();
      });

      filtered.sort((a: any, b: any) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime());

      const formattedEvents = filtered.map((item: any, index: number) => {
        const eventDate = new Date(item.starttime);
        const y = eventDate.getFullYear();
        const m = (eventDate.getMonth() + 1).toString().padStart(2, '0');
        const d = eventDate.getDate().toString().padStart(2, '0');
        const weekday = ["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()];
        const formattedDate = `${y}/${m}/${d} (${weekday})`;

        return {
          id: `e${index + 1}`,
          title: item.title,
          date: formattedDate,
          detail: `【詳細情報】\n\n${item.text || "詳細情報なし"}`,
        };
      });

      setUpcomingEvents(formattedEvents);
    } catch (error) {
      console.error("データ取得エラー:", error);
    } finally {
      setLoadingFetchPosts(false);
    }
  };

  useEffect(() => { fetchUserInfo(); }, []);
  useEffect(() => { fetchUserMessages(); }, []);
  useEffect(() => { fetchPosts(); }, []);

  const loading = loadingFetchPosts || loadingFetchUserInfo || loadingFetchUserMessage

  const notices = useMemo(
    () =>
      [...noticesData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [noticesData]
  );
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<typeof notices[0] | null>(
    null
  );

  const openNoticeModal = async (notice: Notice) => {
    setSelectedNotice(notice);

    // クライアント側で即時にステート更新（UI反映）
    setNoticesData((prev) =>
      prev.map((n) =>
        n.id === notice.id ? { ...n, read: true } : n
      )
    );

    // Firestore に既読フラグを書き込み
    try {
      await fetch("http://localhost:8080/api/v1/user/update/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          message_id: notice.id,
        }),
      });
    } catch (error) {
      console.error("既読状態の更新に失敗しました", error);
    }

    setNoticeModalVisible(true);
  };


  const closeNoticeModal = () => setNoticeModalVisible(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(
    null
  );

  const openEventModal = (evt: typeof upcomingEvents[0]) => {
    setSelectedEvent(evt);
    setEventModalVisible(true);
  };
  const closeEventModal = () => setEventModalVisible(false);

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("qwer")
    try {
      setLoadingFetchUserInfo(true);
      setLoadingFetchUserMessage(true);
      setLoadingFetchPosts(true);

      await Promise.all([
        fetchUserInfo(),
        fetchUserMessages(),
        fetchPosts(),
      ]);
    } catch (err) {
      console.error("更新中にエラーが発生しました", err);
    } finally {
      setRefreshing(false);
    }
  };


  return (
    loading ? (
  <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
) : (
    <View style={styles.root}>
      {/* アカウントアイコン */}
      <TouchableOpacity style={styles.accountIcon}>
        <Ionicons name="person-circle-outline" size={32} color="#333" />
      </TouchableOpacity>

      <Stack.Screen options={{ title: "ホーム" }} />

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#007AFF"]}
          tintColor="#007AFF"
        />
        }>
        {/* バナー */}
        {/* <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: "https://via.placeholder.com/400x120.png?text=防災・防犯・イベント",
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View> */}

        {/* ユーザー情報 */}
        <View style={[styles.section, styles.userInfoContainer]}>
          <Ionicons name="home-outline" size={24} color="#007AFF" />
          <Text style={styles.userName}>{userName} さん</Text>
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
                  item.read && styles.noticeItemSeen,
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

      {/* 更新ボタン */}
      <TouchableOpacity
              onPress={() => {
                setLoadingFetchUserInfo(true);
                setLoadingFetchUserMessage(true);
                setLoadingFetchPosts(true);
                fetchUserInfo();
                fetchUserMessages();
                fetchPosts();
              }}
              style={{
                margin: 16,
                backgroundColor: "#007AFF",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>最新の情報に更新</Text>
      </TouchableOpacity>

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
                router.push("/tabs/schedule");
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
  ));
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
