import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, type UserRole } from '@/context/AuthContext';

export default function AuthScreen() {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isLoading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    setMessage(null);
    setIsSubmitting(true);

    const result = isSignUp
      ? await signUp(email, password, selectedRole)
      : await signIn(email, password, selectedRole);

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    if (isSignUp) {
      setMessage('Account created. If email confirmation is enabled, confirm your email before signing in.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../QueueMe.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.subtitle}>Secure queueing for customers and businesses.</Text>
        </View>

        <View style={styles.roleSwitch}>
          <TouchableOpacity
            onPress={() => setSelectedRole('customer')}
            style={[styles.roleButton, selectedRole === 'customer' && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, selectedRole === 'customer' && styles.roleTextActive]}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedRole('business')}
            style={[styles.roleButton, selectedRole === 'business' && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, selectedRole === 'business' && styles.roleTextActive]}>Business</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#94A3B8"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#94A3B8"
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.buttonGradient}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsSignUp((prev) => !prev);
            setMessage(null);
          }}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoImage: {
    width: 220,
    height: 78,
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
    marginTop: 8,
    lineHeight: 20,
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  roleText: {
    color: '#334155',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
  },
  actionButton: {
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  switchButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  message: {
    color: '#B91C1C',
    marginTop: 4,
    marginBottom: 8,
  },
});
