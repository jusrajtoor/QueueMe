import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  useFrameworkReady();

  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/auth'} />;
}
