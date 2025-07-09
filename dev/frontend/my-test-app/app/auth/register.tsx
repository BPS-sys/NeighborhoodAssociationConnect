// app/(tabs)/RegisterScreen.tsx - Modern UI Version
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

import Constants from 'expo-constants';



const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [townId, setTownId] = useState("");
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [phone3, setPhone3] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [townIdList, setTownIdList] = useState<{ id: string; name: string }[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [role, setRole] = useState('会員');

  

  useEffect(() => {
    // フェードインアニメーション
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    const fetchTownIds = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/regions/names', {
          headers: {
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          }
        });
        const data = await res.json();
        setTownIdList(data);
        if (data.length > 0) {
          setTownId(data[0].id);
        }
      } catch (error) {
        console.error('地域一覧の取得に失敗しました:', error);
      }
    };

    fetchTownIds();
  }, []);

  const togglePasswordVisibility = () => {
    const currentScrollY = scrollPosition;
    setShowPassword(!showPassword);
    
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: currentScrollY, animated: false });
      }
    }, 10);
  };

  const handleScroll = (event: any) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const clearError = () => {
    if (error) setError('');
  };

  const handleRegister = async () => {
    // バリデーション
    if (name.trim() === '') {
      setError('お名前を入力してください。');
      return;
    }
    if (birthYear.length !== 4 || birthMonth.length !== 2 || birthDay.length !== 2) {
      setError('生年月日はYYYY/MM/DD形式で入力してください。');
      return;
    }
    if (address.trim() === '') {
      setError('住所を入力してください。');
      return;
    }
    if (phone1.length < 3 || phone2.length < 3 || phone3.length < 4) {
      setError('電話番号は正しい形式で入力してください（例：090-1234-5678）。');
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

    setError('');
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      const userId = userCredential.user.uid;
      const birthday = `${birthYear}${birthMonth}${birthDay}`;
      const phone_number = `${phone1}-${phone2}-${phone3}`;

      try {
        const res = await fetch('http://192.168.11.7:8080/api/v1/regist/userid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Constants.expoConfig?.extra?.backendAPIKey}`
          },
          body: JSON.stringify({
            user_id: userId,
            birthday,
            name,
            phone_number,
            region_id: townId.toString(),
            address,
            role
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
      router.push('/auth/verify');
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
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* グラデーション背景ヘッダー */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientHeader}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="person-add" size={28} color="#fff" />
          </View>
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>アカウントを作成してください</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.formCard}>
            {error !== '' && (
              <Animated.View style={styles.errorContainer}>
                <MaterialIcons name="error" size={18} color="#ef4444" />
                <Text style={styles.error}>{error}</Text>
                <TouchableOpacity onPress={() => setError('')} style={styles.errorClose}>
                  <MaterialIcons name="close" size={16} color="#ef4444" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* 地域選択 */}
            <InputContainer label="地域">
              <View style={styles.pickerContainer}>
                <MaterialIcons name="location-on" size={18} color="#667eea" style={styles.inputIcon} />
                <Picker
                  selectedValue={townId}
                  onValueChange={(value) => {
                    setTownId(value);
                    clearError();
                  }}
                  mode="dropdown"
                  style={styles.picker}
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
            </InputContainer>

            <InputContainer label="役割">
              <View style={styles.pickerContainer}>
                <MaterialIcons name="group" size={18} color="#667eea" style={styles.inputIcon} />
                <Picker
                  selectedValue={role}
                  onValueChange={(value) => {
                    setRole(value);
                    clearError();
                  }}
                  mode="dropdown"
                  style={styles.picker}
                >
                  <Picker.Item label="会員" value="会員" />
                  <Picker.Item label="役員" value="役員" />
                </Picker>
              </View>
            </InputContainer>

            {/* お名前 */}
            <InputContainer label="お名前">
              <View style={[styles.inputWrapper, name && styles.inputFocused]}>
                <MaterialIcons name="person" size={18} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="山田太郎"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError();
                  }}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </InputContainer>

            {/* 生年月日 */}
            <InputContainer label="生年月日">
              <View style={styles.birthContainer}>
                <View style={styles.birthCard}>
                  <MaterialIcons name="cake" size={16} color="#667eea" style={styles.birthIcon} />
                  <View style={styles.birthInputGroup}>
                    <View style={styles.birthInputWrapper}>
                      <TextInput
                        style={styles.birthInput}
                        placeholder="1990"
                        value={birthYear}
                        onChangeText={(t) => {
                          setBirthYear(t.replace(/[^0-9]/g, ''));
                          clearError();
                        }}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholderTextColor="#9ca3af"
                      />
                      <Text style={styles.birthLabel}>年</Text>
                    </View>
                    <Text style={styles.birthSeparator}>/</Text>
                    <View style={styles.birthInputWrapper}>
                      <TextInput
                        style={styles.birthInput}
                        placeholder="01"
                        value={birthMonth}
                        onChangeText={(t) => {
                          setBirthMonth(t.replace(/[^0-9]/g, ''));
                          clearError();
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholderTextColor="#9ca3af"
                      />
                      <Text style={styles.birthLabel}>月</Text>
                    </View>
                    <Text style={styles.birthSeparator}>/</Text>
                    <View style={styles.birthInputWrapper}>
                      <TextInput
                        style={styles.birthInput}
                        placeholder="01"
                        value={birthDay}
                        onChangeText={(t) => {
                          setBirthDay(t.replace(/[^0-9]/g, ''));
                          clearError();
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholderTextColor="#9ca3af"
                      />
                      <Text style={styles.birthLabel}>日</Text>
                    </View>
                  </View>
                </View>
              </View>
            </InputContainer>

            {/* 住所 */}
            <InputContainer label="住所">
              <View style={[styles.inputWrapper, address && styles.inputFocused]}>
                <MaterialIcons name="home" size={18} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="東京都渋谷区〇〇 1-2-3"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    clearError();
                  }}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </InputContainer>

            {/* 電話番号 */}
            <InputContainer label="電話番号">
              <View style={styles.phoneCard}>
                <MaterialIcons name="phone" size={18} color="#667eea" style={styles.inputIcon} />
                <View style={styles.phoneInputGroup}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="090"
                    value={phone1}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setPhone1(numericText);
                      clearError();
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.phoneSeparator}>-</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="1234"
                    value={phone2}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setPhone2(numericText);
                      clearError();
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.phoneSeparator}>-</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="5678"
                    value={phone3}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setPhone3(numericText);
                      clearError();
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </InputContainer>

            {/* メールアドレス */}
            <InputContainer label="メールアドレス">
              <View style={[styles.inputWrapper, email && styles.inputFocused]}>
                <MaterialIcons name="email" size={18} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </InputContainer>

            {/* パスワード */}
            <InputContainer label="パスワード">
              <View style={[styles.passwordContainer, password && styles.inputFocused]}>
                <MaterialIcons name="lock" size={18} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="6文字以上で入力"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={18}
                    color="#667eea"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordStrength}>
                <View style={[
                  styles.strengthBar,
                  password.length >= 6 && styles.strengthBarActive
                ]} />
                <View style={[
                  styles.strengthBar,
                  password.length >= 8 && styles.strengthBarActive
                ]} />
                <View style={[
                  styles.strengthBar,
                  password.length >= 10 && styles.strengthBarActive
                ]} />
              </View>
            </InputContainer>

            {/* 登録ボタン */}
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading ? ['#ccc', '#999'] : ['#667eea', '#764ba2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.registerButtonText}>登録中...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.registerButtonText}>アカウントを作成</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>または</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>ログインはこちら</Text>
              <MaterialIcons name="login" size={16} color="#667eea" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginTop: -20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  requiredMark: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 50,
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: '#667eea',
    backgroundColor: '#fff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingLeft: 8,
  },
  inputIcon: {
    marginRight: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  picker: {
    flex: 1,
    marginLeft: 8,
  },
  birthContainer: {
    marginTop: 4,
  },
  birthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  birthIcon: {
    marginRight: 8,
  },
  birthInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  birthInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  birthInput: {
    fontSize: 15,
    color: '#1f2937',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 50,
    marginRight: 4,
  },
  birthLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontweight: '500',
  },
  birthSeparator: {
    fontSize: 16,
    color: '#667eea',
    marginHorizontal: 8,
    fontWeight: '600',
  },
  phoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  phoneInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  phoneInput: {
    fontSize: 15,
    color: '#1f2937',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
    flex: 1,
  },
  phoneSeparator: {
    fontSize: 16,
    color: '#667eea',
    marginHorizontal: 8,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingLeft: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordStrength: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: '#10b981',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorClose: {
    padding: 4,
  },
  registerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#667eea',
    borderRadius: 12,
    height: 50,
    backgroundColor: '#fff',
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600',
  },
});


const InputContainer = ({ children, label, required = true }: { 
    children: React.ReactNode; 
    label: string; 
    required?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {required && <Text style={styles.requiredMark}>*</Text>}
      </View>
      {children}
    </View>
  );