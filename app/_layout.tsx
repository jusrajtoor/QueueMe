import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { QueueProvider } from '@/context/QueueContext';
import { AuthProvider } from '@/context/AuthContext'; // ⬅️ Import your AuthProvider

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider> {/* ✅ Wrap everything inside AuthProvider */}
      <QueueProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QueueProvider>
    </AuthProvider>
  );
}
