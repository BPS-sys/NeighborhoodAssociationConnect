import { Slot, useRouter } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    router.replace('/auth/login');
  }, [mounted]);

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}


// Copyright (c) 2025 JyuntaMukaihira, HayatoNakamura, YukiTakayama
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。