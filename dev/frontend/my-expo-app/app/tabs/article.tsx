import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ArticleScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [binaryData, setBinaryData] = useState<ArrayBuffer | null>(null);
  const [loadingConvert, setLoadingConvert] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [articleText, setArticleText] = useState<string>('');

  // フォーム状態
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState('防災');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPostDisabled, setIsPostDisabled] = useState(false);


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

  // 画像選択 → URI 設定 & バイナリ変換
  const pickAndConvert = async () => {
    setIsPostDisabled(false); // 新しい画像を選んだら投稿を許可
    setBinaryData(null);
    setArticleText('');
    // 1) 画像を選択
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;

    setImageUri(uri);
    setLoadingConvert(true);

    try {
      // 2) fetch でバイナリ取得
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
      const response = await fetch('http://localhost:8080/api/v1/upload-binary-image', {
        method: 'POST',
        headers: {
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
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setStartTime(selectedDate);
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
      const url = `http://localhost:8080/api/v1/regions/ugyGiVvlg4fDN2afMnoe(RegionID)/news`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
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
      // 投稿成功後に状態リセットするならここでsetStateを使う

    } catch (e) {
      Alert.alert("送信エラー", String(e));
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: '記事投稿' }} />

        <Text style={styles.instruction}>記事にする写真をアップロードする</Text>

        <TouchableOpacity style={styles.plusButton} onPress={pickAndConvert}>
          {loadingConvert ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="add" size={36} color="#fff" />
          )}
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

        {binaryData && (
          <Text style={styles.infoText}>バイナリ変換済み：{binaryData.byteLength} bytes</Text>
        )}

        <TouchableOpacity
          onPress={upload}
          style={[styles.actionButton, loadingUpload && { opacity: 0.6 }]}
          disabled={loadingUpload}
        >
          {loadingUpload ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>送信してOCR・記事生成</Text>
          )}
        </TouchableOpacity>

        {articleText ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>記事プレビュー</Text>
            <ScrollView style={styles.previewBox}>
              <Text style={styles.previewText}>{articleText}</Text>
            </ScrollView>

            {/* 追加：記事情報フォーム */}
            <View style={styles.formContainer}>
              <Text style={styles.label}>タイトル</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="記事のタイトルを入力"
              />

              <Text style={styles.label}>カテゴリ</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={columns} onValueChange={(val) => setColumns(val)}>
                  <Picker.Item label="防災" value="防災" />
                  <Picker.Item label="防犯" value="防犯" />
                  <Picker.Item label="イベント" value="イベント" />
                </Picker>
              </View>

              <Text style={styles.label}>開始日時 (任意)</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Text>{startTime ? startTime.toLocaleString() : '日時を選択'}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={startTime || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              <TouchableOpacity onPress={postArticle} style={styles.postButton}>
                <Text style={styles.actionButtonText}>この記事を投稿する</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    marginTop: 24,
    width: '90%',
  },
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5', alignItems: 'center' },
  instruction: { fontSize: 16, color: '#333', marginVertical: 16, textAlign: 'center' },
  plusButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { marginTop: 16, width: '80%', height: 200, borderRadius: 8 },
  infoText: { marginTop: 12, color: '#555' },
  actionButton: {
    marginTop: 24,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  previewTitle: { fontSize: 18, fontWeight: '700', marginVertical: 12 },
  previewBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    maxHeight: 180, // プレビュー高さ制限（スクロール可能）
  },
  previewText: { fontSize: 16, color: '#333' },

  // 追加フォーム関連
  formContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  pickerWrapper: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 6,
  },
  dateButton: {
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 6,
  },
  postButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
});