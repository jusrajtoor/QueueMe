import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const { user, isLoading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isLoading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    setMessage(null);
    setIsSubmitting(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

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
      <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />

      <View style={styles.content}>
        <Text style={styles.title}>QueueMe</Text>
        <Text style={styles.subtitle}>Sign in to create and join shared queues across devices.</Text>

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
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.buttonGradient}>
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
    backgroundColor: '#F9FAFB',
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
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#2563EB',
    fontWeight: '600',
  },
  message: {
    color: '#B91C1C',
    marginTop: 4,
    marginBottom: 8,
  },
});
