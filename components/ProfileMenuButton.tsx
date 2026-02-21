import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ProfileMenu } from '@/components/ProfileMenu';
import { getDisplayName, getInitials } from '@/utils/profileUtils';

interface ProfileMenuButtonProps {
  style?: ViewStyle;
  size?: number;
}

export const ProfileMenuButton = ({ style, size = 42 }: ProfileMenuButtonProps) => {
  const { user, profile, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const displayName = useMemo(() => getDisplayName(profile, user?.email), [profile, user?.email]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const handleLogout = async () => {
    setMenuVisible(false);
    const result = await signOut();

    if (result.error) {
      Alert.alert('Logout Failed', result.error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.profileButton,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
        onPress={() => setMenuVisible(true)}
      >
        {profile?.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.profileImage} />
        ) : (
          <Text style={styles.profileInitials}>{initials}</Text>
        )}
      </TouchableOpacity>

      <ProfileMenu
        visible={menuVisible}
        profile={profile}
        email={user?.email}
        onClose={() => setMenuVisible(false)}
        onOpenProfile={() => {
          setMenuVisible(false);
          router.push('/(tabs)/profile' as never);
        }}
        onLogout={handleLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
