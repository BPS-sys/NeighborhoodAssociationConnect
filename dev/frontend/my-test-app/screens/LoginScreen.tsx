// frontend/my-expo-app/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'test@example.com' && password === '123456') {
      Alert.alert('ログイン成功！');
      onLoginSuccess();
    } else {
      Alert.alert('メールアドレスまたはパスワードが違います。');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput style={styles.input} placeholder="メールアドレス" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="パスワード" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 8 },
  button: { backgroundColor: '#00BCD4', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。