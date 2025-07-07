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
