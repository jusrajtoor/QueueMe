import { Tabs } from 'expo-router';
import { Chrome as Home, UserPlus, ListPlus, ChartBar as BarChart4 } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF'
        },
        tabBarItemStyle: {
          paddingVertical: 5
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <ListPlus size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="join"
        options={{
          title: 'Join',
          tabBarIcon: ({ color, size }) => <UserPlus size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color, size }) => <BarChart4 size={size} color={color} />
        }}
      />
    </Tabs>
  );
}