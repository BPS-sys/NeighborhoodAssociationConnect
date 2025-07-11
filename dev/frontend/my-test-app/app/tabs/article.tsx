import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function ArticleScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [binaryData, setBinaryData] = useState<ArrayBuffer | null>(null);
  const [loadingConvert, setLoadingConvert] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [articleText, setArticleText] = useState<string>('a');
  const { userId, userName, RegionID, regionName } = useAuth();

  // フォーム状態
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState('防災');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPostDisabled, setIsPostDisabled] = useState(false);

  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  // 権限リクエスト
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('カメラロールの権限が必要です');
        }
      }
    })();
  }, []);

  const showPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
  };

  // 画像選択 → URI 設定 & バイナリ変換
  const pickAndConvert = async () => {
    setIsPostDisabled(false);
    setBinaryData(null);
    setArticleText('');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    setLoadingConvert(true);

    try {
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      setBinaryData(arrayBuffer);
    } catch (e) {
      Alert.alert('バイナリ変換エラー', String(e));
    } finally {
      setLoadingConvert(false);
    }
  };

  // 画像バイナリ送信 → OCR＆記事生成 → プレビュー表示
  const upload = async () => {
    if (!binaryData) {
      Alert.alert('画像を選択してください');
      return;
    }

    setLoadingUpload(true);
    setArticleText('');
    try {
      const response = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/upload-binary-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: binaryData,
      });

      if (!response.ok) {
        const err = await response.json();
        Alert.alert('アップロード失敗', err.detail || '不明なエラー');
        return;
      }

      const result = await response.json();
      setArticleText(result);
    } catch (e) {
      Alert.alert('送信エラー', String(e));
    } finally {
      setLoadingUpload(false);
    }
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
      showPicker('date');
    }
  };

  // 投稿処理
  const postArticle = async () => {
    if (!articleText) {
      Alert.alert('記事がありません');
      return;
    }
    if (!title.trim()) {
      Alert.alert('タイトルを入力してください');
      return;
    }

    const postData = {
      title,
      text: articleText,
      columns,
      start_time: startTime ? startTime.toISOString() : null,
    };

    try {
      const url = `${Constants.expoConfig?.extra?.deployUrl}/api/v1/regions/${RegionID}/news`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("投稿失敗", errorData.detail || "不明なエラー");
        return;
      }

      Alert.alert("投稿完了", "記事を投稿しました！");
      setIsPostDisabled(true);
    } catch (e) {
      Alert.alert("送信エラー", String(e));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '防災': return 'security';
      case '防犯': return 'shield';
      case 'イベント': return 'event';
      default: return 'article';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '防災': return '#ff6b6b';
      case '防犯': return '#4ecdc4';
      case 'イベント': return '#45b7d1';
      default: return '#667eea';
    }
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ 
        title: '記事投稿',
        headerStyle: { backgroundColor: '#667eea' },
        headerTitleStyle: { color: '#fff', fontWeight: '700' },
        headerTintColor: '#fff'
      }} />
      
      <View style={styles.container}>
        {/* ヘッダーセクション */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>新しい記事を投稿</Text>
          <Text style={styles.subtitle}>写真から記事を自動生成します</Text>
        </View>

        {/* 画像アップロードセクション */}
        <View style={styles.uploadCard}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="photo-camera" size={20} color="#667eea" /> 写真をアップロード
          </Text>
          
          <TouchableOpacity 
            style={[styles.uploadButton, loadingConvert && styles.uploadButtonLoading]} 
            onPress={pickAndConvert}
            disabled={loadingConvert}
          >
            {loadingConvert ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>処理中...</Text>
              </View>
            ) : (
              <View style={styles.uploadContent}>
                <MaterialIcons name="add-photo-alternate" size={48} color="#667eea" />
                <Text style={styles.uploadButtonText}>写真を選択</Text>
                <Text style={styles.uploadHint}>タップして画像を選択してください</Text>
              </View>
            )}
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.previewImageContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <View style={styles.imageOverlay}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              </View>
            </View>
          )}

          {binaryData && (
            <TouchableOpacity
              onPress={upload}
              style={[styles.generateButton, loadingUpload && styles.buttonDisabled]}
              disabled={loadingUpload}
            >
              {loadingUpload ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>生成中...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                  <Text style={styles.buttonText}>記事を生成</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 記事プレビューセクション */}
        {articleText ? (
          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="preview" size={20} color="#667eea" /> 記事プレビュー
            </Text>
            
            <View style={styles.articleContainer}>
              <TextInput
                style={styles.articleInput}
                multiline
                value={articleText}
                onChangeText={setArticleText}
                placeholder="生成された記事がここに表示されます"
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            {/* フォームセクション */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>記事情報</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <MaterialIcons name="title" size={16} color="#555" /> タイトル
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="記事のタイトルを入力してください"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <MaterialIcons name={getCategoryIcon(columns)} size={16} color={getCategoryColor(columns)} /> 
                  {' '}カテゴリ
                </Text>
                <View style={[styles.pickerContainer, { borderColor: getCategoryColor(columns) }]}>
                  <Picker 
                    selectedValue={columns} 
                    onValueChange={(val) => setColumns(val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="🛡️ 防災" value="防災" />
                    <Picker.Item label="🔒 防犯" value="防犯" />
                    <Picker.Item label="🎉 イベント" value="イベント" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <MaterialIcons name="schedule" size={16} color="#555" /> 開始日時 (任意)
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)} 
                  style={styles.dateButton}
                >
                  <MaterialIcons name="event" size={20} color="#667eea" />
                  <Text style={styles.dateButtonText}>
                    {startTime ? startTime.toLocaleString('ja-JP') : '日時を選択してください'}
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={startTime || new Date()}
                  mode={pickerMode}
                  display="default"
                  onChange={onChangeDate}
                />
              )}


              <TouchableOpacity 
                onPress={postArticle} 
                style={[styles.postButton, isPostDisabled && styles.postButtonDisabled]} 
                disabled={isPostDisabled}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons 
                    name={isPostDisabled ? "check-circle" : "publish"} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.postButtonText}>
                    {isPostDisabled ? '投稿完了' : '記事を投稿する'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  
  // ヘッダーセクション
  headerSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },

  // カードスタイル
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formCard: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // セクションタイトル
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 16,
  },

  // アップロードボタン
  uploadButton: {
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    minHeight: 160,
  },
  uploadButtonLoading: {
    borderColor: '#cbd5e0',
    backgroundColor: '#f7fafc',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 12,
    fontWeight: '500',
  },

  // 画像プレビュー
  previewImageContainer: {
    marginTop: 20,
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: width - 80,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // ボタン
  generateButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // 記事入力
  articleContainer: {
    marginBottom: 20,
  },
  articleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
    color: '#2d3748',
  },

  // フォーム要素
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2d3748',
  },
  pickerContainer: {
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 12,
  },

  // 投稿ボタン
  postButton: {
    backgroundColor: '#48bb78',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 20,
    shadowColor: '#48bb78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#68d391',
    shadowOpacity: 0.2,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});