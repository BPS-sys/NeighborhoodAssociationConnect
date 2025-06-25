// Firebaseメール確認なしログイン
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // 自分のfirebase.tsで設定したauthをインポート
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const user_id = user.uid;
      login(user_id);
      router.replace('/tabs');
    } catch (err) {
      setError('メールアドレスまたはパスワードが間違っています');
      setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="パスワード"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <MaterialIcons
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={styles.registerText}>新規登録はこちら</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  button: {
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#00BCD4',
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});
