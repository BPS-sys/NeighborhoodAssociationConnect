import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  FlatList
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const SendMessagePage: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [selectedRegionUsers, setSelectedRegionUsers] = useState<{ id: string; name: string }[]>([]);
  const { userName, RegionID } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUserMessages, setSelectedUserMessages] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUserName, setModalUserName] = useState('');

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

  const handleUserPress = async (userId: string, name: string) => {
    setModalUserName(name);
    setSelectedUserMessages([]);
    setModalVisible(true);
    try {
      const res = await fetch(`${Constants.expoConfig?.extra?.deployUrl}/api/v1/users/messages?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
        }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelectedUserMessages(data.sort((a: any, b: any) => new Date(b.Senttime).getTime() - new Date(a.Senttime).getTime()));
    } catch (err) {
      Alert.alert("エラー", "メッセージ取得に失敗しました");
      console.error(err);
    }
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
      <View style={styles.userListContainer}>
        <Text style={styles.subTitle}>👥 地域ユーザー一覧</Text>
        {selectedRegionUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => handleUserPress(user.id, user.name)}
          >
            <Text style={styles.userCardText}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ メッセージモーダル */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{modalUserName} さんのメッセージ一覧</Text>
          <FlatList
            data={selectedUserMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.messageItem}>
                <Text style={styles.messageTitle}>
                  {(item.Title || '').length > 25 ? (item.Title || '').slice(0, 25)+'...' : (item.Title || '')}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.messageRead}>{item.read ? '✅ 既読' : '📭 未読'}</Text>
                  <Text style={styles.messageDate}>
                    {item.Senttime ? new Date(item.Senttime).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text>メッセージがありません。</Text>}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  userListContainer: {
    width: '90%',
    marginTop: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  userCard: {
    backgroundColor: '#edf2f7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userCardText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messageItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  messageTitle: {
    fontSize: 16,
  },
  messageRead: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  messageDate: {
  fontSize: 14,
  color: '#666',
  },
});

export default SendMessagePage;
