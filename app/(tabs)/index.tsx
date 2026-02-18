import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ListPlus, UserPlus, LogOut } from 'lucide-react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  useFrameworkReady();
  const { user, signOut } = useAuth();

  const navigateToCreate = () => {
    router.push('/(tabs)/create');
  };

  const navigateToJoin = () => {
    router.push('/(tabs)/join');
  };

  const handleLogout = async () => {
    const result = await signOut();

    if (result.error) {
      Alert.alert('Logout Failed', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />

      <View style={styles.topBar}>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#1E3A8A" size={18} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>QueueMe</Text>
        <Text style={styles.tagline}>Skip the line, not the experience</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToCreate} activeOpacity={0.9}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.buttonContent}>
              <ListPlus color="#FFFFFF" size={30} />
              <Text style={styles.buttonText}>Make a Queue</Text>
              <Text style={styles.buttonSubText}>For businesses & hosts</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToJoin} activeOpacity={0.9}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.buttonContent}>
              <UserPlus color="#FFFFFF" size={30} />
              <Text style={styles.buttonText}>Join a Queue</Text>
              <Text style={styles.buttonSubText}>For customers & guests</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Your queues and membership sync across devices.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topBar: {
    marginTop: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userEmail: {
    color: '#475569',
    fontSize: 13,
    maxWidth: '65%',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: 13,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    flex: 1,
  },
  button: {
    height: 130,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  buttonSubText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});
