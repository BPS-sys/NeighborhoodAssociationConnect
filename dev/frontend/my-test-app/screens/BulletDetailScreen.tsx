import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  ScrollView, 
  View, 
  Platform, 
  StatusBar, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { RootStackParamList } from '../tabs/board';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const API_BASE_URL = `${Constants.expoConfig?.extra?.deployUrl}`;
const { width, height } = Dimensions.get('window');

async function callAPI(endpoint: string, method = 'GET', data = null) {
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
    },
  };
  if (data && method !== 'GET') options.body = JSON.stringify(data);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response.json();
}

export default function BulletDetailScreen({ route, navigation }: Props) {
  const { title, date, content, start_time, id, regionId, category } = route.params;
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    title: title,
    content: content,
  });
  const [startTime, setStartTime] = useState<Date | null>(
    start_time ? new Date(start_time) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [isLoading, setIsLoading] = useState(false);

  const { userRole } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    };
    return date.toLocaleDateString('ja-JP', options).replace('、', ' ');
  };

  const handleEditPress = () => {
    setEditForm({
      title: title,
      content: content,
    });
    setStartTime(start_time ? new Date(start_time) : null);
    setIsEditModalVisible(true);
  };

  // 日時選択関連の関数
  const showPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowDatePicker(true);
  };

  // 日付選択ハンドラ
  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (pickerMode === 'date' && selectedDate) {
      // 日付選択後に時間Pickerを表示
      const currentDate = selectedDate;
      setStartTime((prev) => {
        const updated = new Date(currentDate);
        if (prev) {
          updated.setHours(prev.getHours());
          updated.setMinutes(prev.getMinutes());
        }
        return updated;
      });
      showPicker('time');
    } else if (pickerMode === 'time' && selectedDate) {
      // 時間選択後にstate更新
      setStartTime((prev) => {
        const updated = prev ? new Date(prev) : new Date();
        updated.setHours(selectedDate.getHours());
        updated.setMinutes(selectedDate.getMinutes());
        return updated;
      });
      setShowDatePicker(false);
    }
  };

  const clearStartTime = () => {
    setStartTime(null);
  };

  const formatDateTimeForDisplay = (date: Date | null) => {
    if (!date) return '未設定';
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    });
  };

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      Alert.alert('入力エラー', 'タイトルと内容を入力してください。');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        title: editForm.title,
        text: editForm.content,
        start_time: startTime ? startTime.toISOString() : null,
      };

      await callAPI(`/api/v1/regions/${regionId}/news/${id}`, 'PUT', updateData);
      
      Alert.alert('成功', '記事が更新されました。', [
        {
          text: 'OK',
          onPress: () => {
            setIsEditModalVisible(false);
            navigation.navigate('Home', { shouldRefresh: true });
          }
        }
      ]);
    } catch (error) {
      Alert.alert('エラー', '記事の更新に失敗しました。');
      console.error('Edit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await callAPI(`/api/v1/regions/${regionId}/news/${id}`, 'DELETE');
      
      Alert.alert('成功', '記事が削除されました。', [
        {
          text: 'OK',
          onPress: () => {
            setIsDeleteModalVisible(false);
            navigation.navigate('Home', { shouldRefresh: true });
          }
        }
      ]);
    } catch (error) {
      Alert.alert('エラー', '記事の削除に失敗しました。');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* ヘッダーグラデーション */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>詳細情報</Text>
            <Text style={styles.headerSubtitle}>記事の詳細内容</Text>
          </View>

          {/* 編集・削除ボタン */}
          { userRole === '役員' ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={handleEditPress}
                activeOpacity={0.7}
              >
                <View style={styles.headerActionButtonContainer}>
                  <Ionicons name="create" size={20} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={handleDeletePress}
                activeOpacity={0.7}
              >
                <View style={[styles.headerActionButtonContainer, styles.deleteButton]}>
                  <Ionicons name="trash" size={20} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

        </View>
      </LinearGradient>

      {/* コンテンツ */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              {/* 日付情報エリア */}
              <View style={styles.dateInfoContainer}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.dateBadge}
                >
                  <Ionicons name="calendar" size={16} color="#ffffff" />
                  <Text style={styles.dateText}>投稿日：{formatDate(date)}</Text>
                </LinearGradient>
                
                {/* 開始時間バッジ */}
                {start_time && (
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.startTimeBadge}
                  >
                    <Ionicons name="time" size={16} color="#ffffff" />
                    <Text style={styles.startTimeText}>開始時間：{formatDate(start_time)}</Text>
                  </LinearGradient>
                )}
              </View>

              {/* タイトル */}
              <Text style={styles.title}>{title}</Text>

              {/* 区切り線 */}
              <View style={styles.divider} />

              {/* コンテンツ */}
              <View style={styles.contentContainer}>
                <Text style={styles.content}>{content}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* アクションボタン */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>戻る</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 編集モーダル */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              style={styles.modalKeyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <BlurView intensity={50} style={styles.modalBlurView}>
                <View style={styles.modalContent}>
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    style={styles.modalGradient}
                  >
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>記事を編集</Text>
                      <TouchableOpacity
                        onPress={() => setIsEditModalVisible(false)}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={24} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>タイトル</Text>
                        <TextInput
                          style={styles.titleInput}
                          value={editForm.title}
                          onChangeText={(text) => setEditForm({...editForm, title: text})}
                          placeholder="タイトルを入力"
                          multiline
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>内容</Text>
                        <TextInput
                          style={styles.contentInput}
                          value={editForm.content}
                          onChangeText={(text) => setEditForm({...editForm, content: text})}
                          placeholder="内容を入力"
                          multiline
                          numberOfLines={8}
                          textAlignVertical="top"
                        />
                      </View>

                      {/* 開始日時入力 */}
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>開始日時（任意）</Text>
                          <View style={styles.dateTimePickerContainer}>
                            <TouchableOpacity
                              style={styles.dateTimeButton}
                              onPress={() => showPicker('date')}
                              activeOpacity={0.7}
                            >
                              <View style={styles.dateTimeButtonContent}>
                                <Ionicons name="calendar" size={20} color="#667eea" />
                                <Text style={styles.dateTimeButtonText}>
                                  {formatDateTimeForDisplay(startTime)}
                                </Text>
                              </View>
                            </TouchableOpacity>
                            
                            {startTime && (
                              <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearStartTime}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                              </TouchableOpacity>
                            )}
                          </View>
                          <Text style={styles.helpText}>
                            タップして日時を選択してください
                          </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setIsEditModalVisible(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelButtonText}>キャンセル</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.modalButton, styles.saveButton]}
                        onPress={handleSaveEdit}
                        activeOpacity={0.7}
                        disabled={isLoading}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.saveButtonGradient}
                        >
                          <Text style={styles.saveButtonText}>
                            {isLoading ? '保存中...' : '保存'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              </BlurView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          is24Hour={true}
          locale="ja-JP"
        />
      )}

      {/* 削除確認モーダル */}
      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDeleteModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <BlurView intensity={50} style={styles.modalBlurView}>
              <View style={styles.deleteModalContent}>
                <LinearGradient
                  colors={['#ffffff', '#fef2f2']}
                  style={styles.deleteModalGradient}
                >
                  <View style={styles.deleteModalHeader}>
                    <View style={styles.deleteIconContainer}>
                      <Ionicons name="warning" size={32} color="#ef4444" />
                    </View>
                    <Text style={styles.deleteModalTitle}>記事を削除</Text>
                    <Text style={styles.deleteModalMessage}>
                      この記事を削除してもよろしいですか？
                    </Text>
                    <Text style={styles.deleteModalMessage}>
                      この操作は取り消せません。
                    </Text>
                  </View>

                  <View style={styles.deleteModalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setIsDeleteModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>キャンセル</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.deleteConfirmButton]}
                      onPress={handleConfirmDelete}
                      activeOpacity={0.7}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        style={styles.deleteConfirmButtonGradient}
                      >
                        <Text style={styles.deleteConfirmButtonText}>
                          {isLoading ? '削除中...' : '削除'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // ヘッダー
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    marginLeft: 8,
  },
  headerActionButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },

  // スクロールコンテンツ
  scrollContent: {
    paddingBottom: 40,
  },

  // コンテンツカード
  contentCard: {
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 24,
  },

  // 日付情報エリア
  dateInfoContainer: {
    marginBottom: 20,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
  startTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startTimeText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },

  // タイトル
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 32,
    marginBottom: 20,
  },

  // 区切り線
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 24,
  },

  // コンテンツ
  contentContainer: {
    minHeight: 200,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '400',
  },

  // アクションボタン
  actionContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // モーダル関連 - 修正された部分
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalKeyboardAvoidingView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlurView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 編集モーダル
  modalContent: {
    width: width * 0.95,
    maxWidth: 600,
    height: height * 0.85,
    maxHeight: height * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalGradient: {
    flex: 1,
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    minHeight: 56,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    minHeight: 180,
  },
  
  // 日時入力関連のスタイル
  dateTimePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  clearButton: {
    padding: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    padding: 28,
    paddingTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 削除確認モーダル
  deleteModalContent: {
    width: width * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalGradient: {
    borderRadius: 20,
  },
  deleteModalHeader: {
    alignItems: 'center',
    padding: 32,
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  deleteConfirmButton: {
    overflow: 'hidden',
  },
  deleteConfirmButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});