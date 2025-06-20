// app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext'; // 相対パスに注意

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
