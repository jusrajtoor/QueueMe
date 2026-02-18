import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { ChartBar as BarChart4, Chrome as Home, User, Clock3 } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { user, profile, isLoading, isProfileLoading } = useAuth();

  if (isLoading || (user && isProfileLoading)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  const role = profile?.role ?? 'customer';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1D4ED8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="status"
        options={{
          href: role === 'customer' ? '/(tabs)/status' : null,
          title: 'Status',
          tabBarIcon: ({ color, size }) => <Clock3 size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="manage"
        options={{
          href: role === 'business' ? '/(tabs)/manage' : null,
          title: 'Manage',
          tabBarIcon: ({ color, size }) => <BarChart4 size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="join"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
