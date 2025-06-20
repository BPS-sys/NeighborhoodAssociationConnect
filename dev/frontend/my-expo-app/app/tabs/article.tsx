// app/(tabs)/article.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ArticleScreen() {
  const [imageUri, setImageUri]         = useState<string | null>(null);
  const [binaryData, setBinaryData]     = useState<ArrayBuffer | null>(null);
  const [loadingConvert, setLoadingConvert] = useState(false);

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
    setBinaryData(null);
    // 1) 画像を選択
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.cancelled) return;

    setImageUri(result.uri);
    setLoadingConvert(true);

    try {
      // 2) fetch でバイナリ取得
      const resp = await fetch(result.uri);
      const arrayBuffer = await resp.arrayBuffer();
      setBinaryData(arrayBuffer);
      // ここで binaryData は添付用に ready！
    } catch (e) {
      Alert.alert('バイナリ変換エラー', String(e));
    } finally {
      setLoadingConvert(false);
    }
  };

  // （例）サーバー送信に binaryData を使う
  const upload = async () => {
    if (!binaryData) {
      Alert.alert('画像を選択してください');
      return;
    }
    // 例：FormData に添付
    const form = new FormData();
    form.append('photo', {
      // @ts-ignore
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    // バイナリをそのまま送るなら…
    // form.append('file', new Blob([binaryData]), 'photo.jpg');

    // fetch('https://your.api/upload', { method:'POST', body: form, headers:{ ... } })
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '記事投稿' }} />

      <Text style={styles.instruction}>
        記事にする写真をアップロードする
      </Text>

      {/* ＋ボタン */}
      <TouchableOpacity
        style={styles.plusButton}
        onPress={pickAndConvert}
      >
        {loadingConvert
          ? <ActivityIndicator color="#fff" />
          : <MaterialIcons name="add" size={36} color="#fff" />
        }
      </TouchableOpacity>

      {/* プレビュー */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* binaryData のバイト長表示 */}
      {binaryData && (
        <Text style={styles.infoText}>
          バイナリ変換済み：{binaryData.byteLength} bytes
        </Text>
      )}

      {/* （必要なら）送信ボタン */}
      {/* <Button title="投稿" onPress={upload} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, padding:24, backgroundColor:'#f5f5f5', alignItems:'center' },
  instruction:  { fontSize:16, color:'#333', marginVertical:16, textAlign:'center' },
  plusButton:   { width:80, height:80, borderRadius:40, backgroundColor:'#007AFF', alignItems:'center', justifyContent:'center' },
  preview:      { marginTop:16, width:'80%', height:200, borderRadius:8 },
  infoText:     { marginTop:12, color:'#555' },
});
