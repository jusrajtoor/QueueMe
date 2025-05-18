import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ListPlus, UserPlus } from 'lucide-react-native';

export default function HomeScreen() {
  useFrameworkReady();

  const navigateToCreate = () => {
    router.push('/(tabs)/create');
  };

  const navigateToJoin = () => {
    router.push('/(tabs)/join');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#EFF6FF', '#F9FAFB']}
        style={styles.background}
      />
      
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>QueueMe</Text>
        <Text style={styles.tagline}>Skip the line, not the experience</Text>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={navigateToCreate}
          activeOpacity={0.9}
        >
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
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={navigateToJoin}
          activeOpacity={0.9}
        >
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
        <Text style={styles.footerText}>No registration required</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
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
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
});