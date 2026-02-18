import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { getDisplayName, getInitials } from '@/utils/profileUtils';

export default function ProfileScreen() {
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.fullName ?? '');
    setRole(profile.role);
    setAvatarUrl(profile.avatarUrl);
  }, [profile]);

  const displayName = useMemo(() => getDisplayName(profile, user?.email), [profile, user?.email]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow photo library access to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.45,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];

    if (asset.base64) {
      const mimeType = asset.mimeType || 'image/jpeg';
      setAvatarUrl(`data:${mimeType};base64,${asset.base64}`);
      return;
    }

    setAvatarUrl(asset.uri);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await updateProfile({
      fullName: name.trim() || null,
      avatarUrl,
      role,
    });

    setIsSaving(false);

    if (result.error) {
      Alert.alert('Profile Update Failed', result.error);
      return;
    }

    Alert.alert('Saved', 'Your profile has been updated.');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
            <Text style={styles.photoButtonText}>Change Photo</Text>
          </TouchableOpacity>

          {avatarUrl ? (
            <TouchableOpacity style={styles.removePhotoButton} onPress={() => setAvatarUrl(null)}>
              <Text style={styles.removePhotoText}>Remove Photo</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your display name"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>Email</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{user?.email}</Text>
          </View>

          <Text style={styles.label}>Account Type</Text>
          <View style={styles.roleSwitch}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
              onPress={() => setRole('customer')}
            >
              <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'business' && styles.roleButtonActive]}
              onPress={() => setRole('business')}
            >
              <Text style={[styles.roleText, role === 'business' && styles.roleTextActive]}>Business</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.saveGradient}>
            <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save Profile'}</Text>
          </LinearGradient>
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
  header: {
    marginTop: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 18,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 30,
  },
  photoButton: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
  },
  photoButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  removePhotoButton: {
    marginTop: 8,
  },
  removePhotoText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  label: {
    color: '#334155',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#0F172A',
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  readOnlyInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  readOnlyText: {
    color: '#475569',
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  saveButton: {
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
