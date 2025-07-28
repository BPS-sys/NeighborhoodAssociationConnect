import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../lib/firebase';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkEmailVerified = async () => {
    if (auth.currentUser) {
      setChecking(true);
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setVerified(true);
        router.push('/auth/login');
      } else {
        setVerified(false);
      }
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>メールアドレスの確認リンクを送信しました。</Text>
      <Text style={styles.text}>メールを確認し、「認証完了」ボタンを押してください。</Text>
      <Button title={checking ? "確認中..." : "認証完了"} onPress={checkEmailVerified} disabled={checking} />
      {!verified && <Text style={styles.note}>※ 認証が完了していない場合は、再度このボタンを押してください。</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  note: { marginTop: 12, color: '#999', fontSize: 13 },
});


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。