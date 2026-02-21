import React, { useMemo } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, CirclePlay, UserPlus } from 'lucide-react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/context/AuthContext';
import { getDisplayName } from '@/utils/profileUtils';
import { ProfileMenuButton } from '@/components/ProfileMenuButton';

export default function HomeScreen() {
  useFrameworkReady();

  const { user, profile } = useAuth();

  const displayName = useMemo(() => getDisplayName(profile, user?.email), [profile, user?.email]);
  const isBusiness = profile?.role === 'business';

  const handlePrimaryAction = () => {
    router.push(isBusiness ? '/(tabs)/create' : '/(tabs)/join');
  };

  const handleSecondaryAction = () => {
    router.push(isBusiness ? '/(tabs)/manage' : '/(tabs)/status');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingLabel}>Welcome back</Text>
          <Text style={styles.greetingName}>{displayName}</Text>
        </View>

        <ProfileMenuButton size={44} />
      </View>

      <View style={styles.logoSection}>
        <Image source={require('../../QueueMe.png')} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.tagline}>Fast queues. Better flow. No crowding.</Text>
      </View>

      <View style={styles.roleCard}>
        <View style={styles.roleBadge}>
          {isBusiness ? <Building2 color="#1D4ED8" size={18} /> : <UserPlus color="#1D4ED8" size={18} />}
          <Text style={styles.roleBadgeText}>{isBusiness ? 'Business Mode' : 'Customer Mode'}</Text>
        </View>

        <Text style={styles.roleDescription}>
          {isBusiness
            ? 'Create queue codes for your visitors and manage the live line from one dashboard.'
            : 'Join a queue with a code and track your position in real time.'}
        </Text>

        <TouchableOpacity style={styles.primaryAction} onPress={handlePrimaryAction} activeOpacity={0.92}>
          <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.primaryActionGradient}>
            <Text style={styles.primaryActionText}>{isBusiness ? 'Create a Queue' : 'Join a Queue'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={handleSecondaryAction}>
          <CirclePlay size={17} color="#1D4ED8" />
          <Text style={styles.secondaryActionText}>{isBusiness ? 'Open Manage View' : 'Open Queue Status'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingLabel: {
    color: '#475569',
    fontSize: 13,
  },
  greetingName: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  logoSection: {
    marginTop: 22,
    alignItems: 'center',
  },
  logoImage: {
    width: 230,
    height: 82,
  },
  tagline: {
    marginTop: 6,
    color: '#475569',
    textAlign: 'center',
    fontSize: 15,
  },
  roleCard: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DBEAFE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleBadgeText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  roleDescription: {
    marginTop: 14,
    color: '#334155',
    lineHeight: 21,
    fontSize: 15,
  },
  primaryAction: {
    marginTop: 18,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryAction: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
