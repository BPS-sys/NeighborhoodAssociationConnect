import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  Alert, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const SendMessagePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedRegionUsers, setSelectedRegionUsers] = useState<{ id: string; name: string }[]>([]);
  const { userName, RegionID } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (RegionID) {
      fetchUsersInRegion(RegionID);
    }
  }, [RegionID]);

  const fetchUsersInRegion = async (regionId: string) => {
    setSelectedRegionUsers([]);
    try {
      const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/regions/${regionId}/users`, {
        headers: {
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
        }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelectedRegionUsers(data.users);
    } catch (err) {
      Alert.alert("エラー", "地域のユーザー取得に失敗しました");
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!title || !body) {
      Alert.alert("入力エラー", "タイトルと本文を入力してください");
      return;
    }

    if (!selectedRegionUsers.length) {
      Alert.alert("送信不可", "この地域にはユーザーがいません");
      return;
    }

    setLoading(true);

    const payload = { title, text: body, author: userName };
    let success = 0, failure = 0;

    for (const user of selectedRegionUsers) {
      try {
        const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/users/post/messages?user_id=${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) success++;
        else failure++;
      } catch (err) {
        console.error("送信失敗", err);
        failure++;
      }
    }

    Alert.alert("送信結果", `成功: ${success}, 失敗: ${failure}`);
    setTitle('');
    setBody('');
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.app}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>📨 メッセージ一斉送信</Text>

        {selectedRegionUsers.length > 0 && (
          <View style={styles.userCount}>
            <Text>👥 送信対象: {selectedRegionUsers.length}名のユーザー</Text>
          </View>
        )}

        <View style={styles.inputBox}>
          <TextInput
            placeholder="📝 メッセージのタイトルを入力してください"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.inputBox}>
          <TextInput
            placeholder="✏️ メッセージの本文を入力してください..."
            value={body}
            onChangeText={setBody}
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={6}
            editable={!loading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, loading && { backgroundColor: '#a5b4fc' }]} // ✅ loading時色薄く
          onPress={handleSend}
          activeOpacity={loading ? 1 : 0.8}
          disabled={loading} // ✅ 送信中は無効化
        >
          <Text style={styles.sendButtonText}>
            {loading ? "⏳ 送信中..." : "🚀 メッセージを送信"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  app: {
    flexGrow: 1,
    backgroundColor: '#c3cfe2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#667eea',
  },
  userCount: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e6fffa',
    borderWidth: 1,
    borderColor: '#81e6d9',
    borderRadius: 8,
  },
  inputBox: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SendMessagePage;
