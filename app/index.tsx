import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function Index() {
  useFrameworkReady();
  
  return <Redirect href="/(tabs)" />;
}