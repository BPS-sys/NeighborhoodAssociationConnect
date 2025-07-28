// app/(tabs)/index.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get("window");
const MODAL_MAX_HEIGHT = height * 0.6;

type Notice = {
  id: string;
  title: string;
  date: string; // yyyy-MM-dd
  detail: string;
  isEmergency: boolean;
  read: boolean;
  author: string;
  sentDate: Date; // 追加: ソート・表示用
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
      isEmergency: /緊急|重要|避難|災害|台風/.test(msg.Title || ""),
      read: msg.read,
      author: msg.author,
      sentDate, // 追加
    };
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const [loadingFetchUserMessage, setLoadingFetchUserMessage] = useState(true);
  const [loadingFetchPosts, setLoadingFetchPosts] = useState(true);
  const [noticesData, setNoticesData] = useState<Notice[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<{
  id: string;
  title: string;
  date: string;
  detail: string;
  }[]>([]);
  const { userId, userName, RegionID, regionName, userRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  // 新しいステート（既存のuseStateの後に追加）
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);

  const openUserInfoModal = () => setUserInfoModalVisible(true);
  const closeUserInfoModal = () => setUserInfoModalVisible(false);

  const fetchUserMessages = async () => {
    try {
      const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/users/messages?user_id=${userId}`, {
        headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
      });
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
      const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/regions/${RegionID}/news`, {
        headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
      });
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
      const hh = eventDate.getHours().toString().padStart(2, '0');
      const mm = eventDate.getMinutes().toString().padStart(2, '0');
      const weekday = ["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()];

      const formattedDate = `${y}/${m}/${d} (${weekday}) ${hh}:${mm}`;

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

  
  useEffect(() => { fetchUserMessages(); }, [userId]);
  useEffect(() => { fetchPosts(); }, [RegionID]);

  const loading = loadingFetchPosts || loadingFetchUserMessage

  const notices = useMemo(
  () =>
    [...noticesData].sort(
      (a, b) => b.sentDate.getTime() - a.sentDate.getTime()
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
      await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/user/update/read`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`,
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
      setLoadingFetchUserMessage(true);
      setLoadingFetchPosts(true);

      await Promise.all([
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
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </LinearGradient>
    ) : (
      <View style={styles.root}>
        {/* ヘッダーグラデーション */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.headerGradient}
        >
          {/* アカウントアイコン */}
          <TouchableOpacity style={styles.accountIcon} onPress={openUserInfoModal}>
            <View style={styles.accountIconContainer}>
              <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
            </View>
          </TouchableOpacity>

          {/* ユーザー情報 */}
          <View style={styles.userInfoContainer}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color="#ffffff" />
              <Text style={styles.regionName}>{regionName}</Text>
            </View>
            <Text style={styles.userName}>こんにちは、{userName} さん</Text>
          </View>
        </LinearGradient>

        <Stack.Screen options={{ 
          title: "ホーム",
          headerShown: false
        }} />

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#667eea"]}
              tintColor="#667eea"
            />
          }
        >
          {/* 連絡事項セクション */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons name="bell-outline" size={20} color="#667eea" />
              </View>
              <Text style={styles.sectionTitle}>連絡事項</Text>
            </View>
            
            <View style={styles.noticeContainer}>
              {notices.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>新しい連絡事項はありません</Text>
                </View>
              ) : (
                <FlatList
                  data={notices}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.noticeCard,
                        item.read && styles.noticeCardRead,
                        item.isEmergency && styles.noticeCardEmergency,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => openNoticeModal(item)}
                    >
                      <View style={styles.noticeCardContent}>
                        <View style={styles.noticeCardLeft}>
                          {item.isEmergency && (
                            <View style={styles.emergencyBadge}>
                              <MaterialCommunityIcons name="alert" size={16} color="#ef4444" />
                            </View>
                          )}
                          {!item.read && (
                            <View style={styles.unreadDot} />
                          )}
                        </View>
                        <View style={styles.noticeTextContainer}>
                          <Text style={[
                            styles.noticeTitle,
                            item.read && styles.noticeTitleRead
                          ]}>{item.title.length > 25 ? item.title.slice(0, 25) + '...':item.title}</Text>
                          <Text style={styles.noticeDate}>
                            {`${item.sentDate.getFullYear()}/${(item.sentDate.getMonth()+1).toString().padStart(2,'0')}/${item.sentDate.getDate().toString().padStart(2,'0')} ${item.sentDate.getHours().toString().padStart(2,'0')}:${item.sentDate.getMinutes().toString().padStart(2,'0')}`}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                      </View>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>

          {/* イベントセクション */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#667eea" />
              </View>
              <Text style={styles.sectionTitle}>予定されているイベント</Text>
            </View>
            
            <View style={styles.eventContainer}>
              {upcomingEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>予定されているイベントはありません</Text>
                </View>
              ) : (
                <FlatList
                  data={upcomingEvents}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.eventCard}
                      activeOpacity={0.7}
                      onPress={() => openEventModal(item)}
                    >
                      <LinearGradient
                        colors={['#60a5fa', '#3b82f6']}
                        style={styles.eventCardGradient}
                      >
                        <View style={styles.eventCardContent}>
                          <View style={styles.eventIconContainer}>
                            <Ionicons name="calendar" size={20} color="#ffffff" />
                          </View>
                          <View style={styles.eventTextContainer}>
                            <Text style={styles.eventTitle}>{item.title}</Text>
                            <Text style={styles.eventDate}>開催日：{item.date}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>

          {/* 更新ボタン */}
          <View style={styles.updateButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                setLoadingFetchUserMessage(true);
                setLoadingFetchPosts(true);
                fetchUserMessages();
                fetchPosts();
              }}
              style={styles.updateButton}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.updateButtonGradient}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.updateButtonText}>最新の情報に更新</Text>
              </LinearGradient>
            </TouchableOpacity>
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
            <BlurView intensity={100} style={styles.modalBlur}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>
                    {selectedNotice?.isEmergency && "🚨 "}
                    連絡事項
                  </Text>
                  <TouchableOpacity onPress={closeNoticeModal} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalTitle}>
                    {selectedNotice?.title}
                  </Text>
                  <Text style={styles.modalDate}>
                    {selectedNotice && `${selectedNotice.sentDate.getFullYear()}/${(selectedNotice.sentDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedNotice.sentDate.getDate().toString().padStart(2, '0')} ${selectedNotice.sentDate.getHours().toString().padStart(2, '0')}:${selectedNotice.sentDate.getMinutes().toString().padStart(2, '0')}`}
                  </Text>

                  {/* 🆕 Author 表示 */}
                  <Text style={styles.modalAuthor}>
                    投稿者: {selectedNotice?.author || "不明"} 
                  </Text>

                  <Text style={styles.modalBody}>{selectedNotice?.detail}</Text>
                </ScrollView>
                
                <TouchableOpacity style={styles.modalButton} onPress={closeNoticeModal}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>閉じる</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
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
            <BlurView intensity={100} style={styles.modalBlur}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>📅 イベント詳細</Text>
                  <TouchableOpacity onPress={closeEventModal} style={styles.modalCloseButton}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalTitle}>
                    {selectedEvent?.title}
                  </Text>
                  <Text style={styles.modalDate}>
                    開催日：{selectedEvent?.date}
                  </Text>
                  <Text style={styles.modalBody}>{selectedEvent?.detail}</Text>
                </ScrollView>
                
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.scheduleButton]}
                    onPress={() => {
                      closeEventModal();
                      router.push("/tabs/schedule");
                    }}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={styles.modalButtonText}>スケジュール画面へ</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.modalButton} onPress={closeEventModal}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={styles.modalButtonText}>閉じる</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
        <Modal
  animationType="fade"
  transparent
  visible={userInfoModalVisible}
  onRequestClose={closeUserInfoModal}
>
  <TouchableOpacity 
    style={styles.popoverOverlay}
    activeOpacity={1}
    onPress={closeUserInfoModal}
  >
    <View style={styles.userInfoPopover}>
      {/* 吹き出しの矢印 */}
      <View style={styles.popoverArrow} />
      
      {/* ヘッダー */}
      <View style={styles.popoverHeader}>
        <Text style={styles.popoverTitle}>👤 ユーザー情報</Text>
      </View>
      
      {/* コンテンツ */}
      <View style={styles.popoverContent}>
        <View style={styles.userInfoItem}>
          <View style={styles.userInfoIconContainer}>
            <Ionicons name="person-outline" size={18} color="#667eea" />
          </View>
          <View style={styles.userInfoText}>
            <Text style={styles.userInfoLabel}>ユーザー名</Text>
            <Text style={styles.userInfoValue}>{userName}</Text>
          </View>
        </View>
        
        <View style={styles.userInfoItem}>
          <View style={styles.userInfoIconContainer}>
            <Ionicons name="location-outline" size={18} color="#667eea" />
          </View>
          <View style={styles.userInfoText}>
            <Text style={styles.userInfoLabel}>地域</Text>
            <Text style={styles.userInfoValue}>{regionName}</Text>
          </View>
        </View>
        
        <View style={styles.userInfoItem}>
          <View style={styles.userInfoIconContainer}>
            <Ionicons name="shield-outline" size={18} color="#667eea" />
          </View>
          <View style={styles.userInfoText}>
            <Text style={styles.userInfoLabel}>権限</Text>
            <Text style={styles.userInfoValue}>{userRole || "一般ユーザー"}</Text>
          </View>
        </View>
      </View>
      
      {/* ボタン */}
      <View style={styles.popoverButtonContainer}>
        <TouchableOpacity
          style={styles.popoverButton}
          onPress={() => {
            closeUserInfoModal();
            router.push("/auth/login");
          }}
        >
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.popoverButtonGradient}
          >
            <Text style={styles.popoverButtonText}>ログアウト</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
</Modal>

      </View>
    )
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  
  // ローディング
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },

  // ヘッダー
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 24,
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
  userName: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#ffffff",
    textAlign: 'center',
  },

  scrollContent: { 
    paddingBottom: 40,
  },

  // セクション共通
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },

  // 連絡事項
  noticeContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noticeCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noticeCardRead: {
    opacity: 0.7,
  },
  noticeCardEmergency: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  noticeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  noticeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  noticeTextContainer: { 
    flex: 1 
  },
  noticeTitle: { 
    fontSize: 16, 
    color: "#1e293b", 
    fontWeight: "600",
    lineHeight: 22,
  },
  noticeTitleRead: {
    color: "#64748b",
  },
  noticeDate: { 
    fontSize: 14, 
    color: "#64748b", 
    marginTop: 4,
  },

  // イベント
  eventContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  eventCardGradient: {
    padding: 16,
  },
  eventCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventTextContainer: { 
    flex: 1 
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#ffffff",
    lineHeight: 22,
  },
  eventDate: { 
    fontSize: 14, 
    color: "rgba(255, 255, 255, 0.8)", 
    marginTop: 2,
  },

  // 空状態
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },

  // 更新ボタン
  updateButtonContainer: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  updateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  updateButtonText: { 
    color: "#ffffff", 
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },

  // モーダル
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: MODAL_MAX_HEIGHT,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalCloseButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: { 
    flexGrow: 0 
  },
  modalScrollContent: { 
    padding: 20 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 28,
  },
  modalDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  modalBody: { 
    fontSize: 16, 
    lineHeight: 24,
    color: '#374151',
  },
  modalButtonContainer: {
    gap: 8,
    padding: 16,
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  modalButtonText: { 
    color: "#ffffff", 
    fontSize: 16,
    fontWeight: '600',
  },
  modalAuthor: {
  fontSize: 14,
  color: '#64748b',
  marginBottom: 12,
},
  scheduleButton: {},
  // ポップオーバー用スタイル
  popoverOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  userInfoPopover: {
    position: 'absolute',
    top: Platform.OS === "ios" ? 95 : 75,
    right: 20,
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  popoverArrow: {
    position: 'absolute',
    top: -8,
    right: 24,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  popoverHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  popoverTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  popoverContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userInfoIconContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfoText: {
    flex: 1,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  userInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  popoverButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  popoverButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  popoverButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  popoverButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: '600',
  },
});


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。