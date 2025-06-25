// app/(tabs)/RegisterScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';

export default function RegisterScreen() {
  const [townId, setTownId] = useState("");
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');   // 4桁
  const [birthMonth, setBirthMonth] = useState(''); // 2桁
  const [birthDay, setBirthDay] = useState('');     // 2桁
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [townIdList, setTownIdList] = useState<{ id: string; name: string }[]>([]);


  useEffect(() => {
    const fetchTownIds = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/regions/names');
        const data = await res.json();
        setTownIdList(data);
        if (data.length > 0) {
          setTownId(data[0].id); // 初期選択を設定
        }
      } catch (error) {
        console.error('地域一覧の取得に失敗しました:', error);
      }
    };

    fetchTownIds();
  }, []);

  const handleRegister = async () => {
    // 入力チェック
    if (name.trim() === '') {
      setError('お名前を入力してください。');
      return;
    }
    if (birthYear.length !== 4 || birthMonth.length !== 2 || birthDay.length !== 2) {
      setError('生年月日はYYYY/MM/DD形式で入力してください。');
      return;
    }
    if (phone1.length < 3 || phone2.length < 1 || phone3.length < 1) {
      setError('電話番号は3-4-4桁で入力してください。');
      return;
    }
    if (!email) {
      setError('メールアドレスを入力してください。');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return;
    }

    setError(''); // 問題なければクリア
    try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(userCredential.user);

    // ユーザー登録後にFastAPIサーバに登録情報を送信
    const userId = userCredential.user.uid;
    const birthday = `${birthYear}${birthMonth}${birthDay}`;
    const phone_number = `${phone1}-${phone2}-${phone3}`;

    console.log({
      user_id: userId,
      birthday,
      name,
      phone_number,
      region_id: townId.toString(),
    });
    try {
      const res = await fetch('http://localhost:8080/api/v1/regist/userid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          birthday,
          name,
          phone_number,
          region_id: townId.toString(),
        }),
      });

      const result = await res.json();
      console.log("成功:", result);

      if (!res.ok) {
        console.error("APIエラー:", res.status, result);
      }
    } catch (error) {
      console.error("通信エラー:", error);
    }

    // 成功時クリア & 画面遷移
    setTownId('');
    setName('');
    setBirthYear('');
    setBirthMonth('');
    setBirthDay('');
    setPhone1('');
    setPhone2('');
    setPhone3('');
    setEmail('');
    setPassword('');
    router.push('/auth/login');
  } catch (err: any) {
    let message = '登録に失敗しました。';
    if (err.code === 'auth/email-already-in-use') {
      message = 'このメールアドレスはすでに使用されています。';
    } else if (err.code === 'auth/invalid-email') {
      message = 'メールアドレスの形式が正しくありません。';
    } else if (err.code === 'auth/weak-password') {
      message = 'パスワードが弱すぎます（6文字以上が必要です）。';
    }
    setError(message);
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新規登録</Text>

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {/* 町会ID */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={townId}
          onValueChange={(value) => setTownId(value)}
          mode="dropdown"
        >
          {townIdList.map((region) => (
            <Picker.Item
              key={region.id}
              label={region.name}
              value={region.id}
            />
          ))}
        </Picker>
      </View>

      {/* お名前 */}
      <TextInput
        style={styles.input}
        placeholder="お名前"
        value={name}
        onChangeText={setName}
      />

      {/* 生年月日 (YYYY/MM/DD) */}
      <View style={styles.birthContainer}>
        <TextInput
          style={[styles.birthInput, styles.birthYear]}
          placeholder="YYYY"
          value={birthYear}
          onChangeText={(t) => setBirthYear(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.hyphen}>／</Text>
        <TextInput
          style={styles.birthInput}
          placeholder="MM"
          value={birthMonth}
          onChangeText={(t) => setBirthMonth(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={styles.hyphen}>／</Text>
        <TextInput
          style={styles.birthInput}
          placeholder="DD"
          value={birthDay}
          onChangeText={(t) => setBirthDay(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      {/* 電話番号 3-4-4 */}
      <View style={styles.phoneContainer}>
        <TextInput
          style={styles.phoneInput}
          placeholder="電話番号"
          value={phone1}
          onChangeText={(t) => setPhone1(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={3}
        />
        <Text style={styles.hyphen}>‐</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder=""
          value={phone2}
          onChangeText={(t) => setPhone2(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.hyphen}>‐</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder=""
          value={phone3}
          onChangeText={(t) => setPhone3(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      {/* メールアドレス */}
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* パスワード */}
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

      {/* 登録ボタン */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>登録</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.registerText}>ログインはこちら</Text>
      </TouchableOpacity>
    </View>
  );
}

const INPUT_HEIGHT = 48;
const PHONE_INPUT_WIDTH = 80;
const BIRTH_INPUT_WIDTH = 60;

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
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  input: {
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  birthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  birthInput: {
    height: INPUT_HEIGHT,
    width: BIRTH_INPUT_WIDTH,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  birthYear: {
    width: BIRTH_INPUT_WIDTH + 20, // 年だけ少し広く
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  phoneInput: {
    width: PHONE_INPUT_WIDTH,
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  hyphen: {
    marginHorizontal: 6,
    fontSize: 18,
    color: '#333',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  passwordInput: {
    height: INPUT_HEIGHT,
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
});
