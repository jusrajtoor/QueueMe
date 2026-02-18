import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { UserProfile } from '@/context/AuthContext';
import { getDisplayName, getInitials } from '@/utils/profileUtils';

interface ProfileMenuProps {
  visible: boolean;
  profile: UserProfile | null;
  email?: string | null;
  onClose: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const ProfileMenu = ({
  visible,
  profile,
  email,
  onClose,
  onOpenProfile,
  onLogout,
}: ProfileMenuProps) => {
  const displayName = getDisplayName(profile, email);
  const initials = getInitials(displayName);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuCard}>
          <View style={styles.headerRow}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.headerTextWrap}>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.roleText}>{profile?.role === 'business' ? 'Business account' : 'Customer account'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton} onPress={onOpenProfile}>
            <Text style={styles.menuButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuButton, styles.logoutButton]} onPress={onLogout}>
            <Text style={[styles.menuButtonText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    justifyContent: 'flex-start',
    paddingTop: 92,
    paddingHorizontal: 16,
  },
  menuCard: {
    marginLeft: 'auto',
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  nameText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  emailText: {
    color: '#475569',
    fontSize: 12,
    marginTop: 1,
  },
  roleText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  menuButton: {
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginTop: 8,
  },
  menuButtonText: {
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#B91C1C',
  },
});
