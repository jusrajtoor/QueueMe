import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Clock, MapPin, LogOut, Check } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring } from 'react-native-reanimated';
import { ProfileMenuButton } from '@/components/ProfileMenuButton';

export default function QueueStatusScreen() {
  const { currentQueue, currentMember, userPosition, leaveCurrentQueue } = useQueueContext();
  const [isYourTurn, setIsYourTurn] = useState(false);

  const scale = useSharedValue(1);

  useEffect(() => {
    if (userPosition === 1 && !isYourTurn) {
      setIsYourTurn(true);
      scale.value = withSequence(withSpring(1.2, { damping: 2 }), withDelay(200, withSpring(1)));
    } else if (userPosition !== 1 && isYourTurn) {
      setIsYourTurn(false);
    }
  }, [isYourTurn, scale, userPosition]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLeaveQueue = () => {
    if (!currentQueue || !currentMember) {
      return;
    }

    Alert.alert('Leave Queue', 'Are you sure you want to leave the queue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveCurrentQueue();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (!currentQueue || !currentMember) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Queue Status</Text>
          <ProfileMenuButton />
        </View>

        <View style={styles.emptyContainer}>
          <Users size={60} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Not In Any Queue</Text>
          <Text style={styles.emptyDescription}>
            You are not currently in any queue. Join a queue to see your status here.
          </Text>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => router.push('/(tabs)/join')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Join a Queue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const waitTimeMinutes = userPosition && userPosition > 0 ? (userPosition - 1) * (currentQueue.timePerPerson || 5) : 0;

  const turnTime = new Date();
  turnTime.setMinutes(turnTime.getMinutes() + waitTimeMinutes);
  const turnTimeString = turnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />

      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Queue Status</Text>
        <ProfileMenuButton />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.queueCard, animatedCardStyle]}>
          <Text style={styles.queueName}>{currentQueue.name}</Text>

          {isYourTurn ? (
            <View style={styles.yourTurnContainer}>
              <View style={styles.yourTurnIcon}>
                <Check size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.yourTurnText}>It&apos;s Your Turn!</Text>
              <Text style={styles.yourTurnSubtext}>Please proceed to the counter. The staff is ready to assist you.</Text>
            </View>
          ) : (
            <View style={styles.positionContainer}>
              <Text style={styles.positionLabel}>Your Position</Text>
              <Text style={styles.positionNumber}>{userPosition}</Text>
              <Text style={styles.peopleAhead}>
                {userPosition === 1
                  ? 'You are next!'
                  : `${(userPosition ?? 1) - 1} ${(userPosition ?? 1) - 1 === 1 ? 'person' : 'people'} ahead of you`}
              </Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Clock size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{isYourTurn ? 'Ready Now' : 'Estimated Wait Time'}</Text>
                <Text style={styles.infoValue}>
                  {isYourTurn
                    ? '0 minutes'
                    : waitTimeMinutes > 0
                      ? `${waitTimeMinutes} minutes (around ${turnTimeString})`
                      : 'Less than a minute'}
                </Text>
              </View>
            </View>

            {currentQueue.location ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={20} color="#3B82F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{currentQueue.location}</Text>
                </View>
              </View>
            ) : null}
          </View>

          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveQueue}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.leaveButtonText}>Leave Queue</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.queueInfoCard}>
          <Text style={styles.queueInfoTitle}>Queue Details</Text>

          <View style={styles.queueDetailRow}>
            <Text style={styles.queueDetailLabel}>Total people in line</Text>
            <Text style={styles.queueDetailValue}>{currentQueue.people.length}</Text>
          </View>

          <View style={styles.queueDetailRow}>
            <Text style={styles.queueDetailLabel}>Your name</Text>
            <Text style={styles.queueDetailValue}>{currentMember.name}</Text>
          </View>

          <View style={styles.queueDetailRow}>
            <Text style={styles.queueDetailLabel}>Joined at</Text>
            <Text style={styles.queueDetailValue}>
              {new Date(currentMember.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {currentQueue.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{currentQueue.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerSpacer: {
    width: 42,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  joinButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  positionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  positionLabel: {
    color: '#64748B',
  },
  positionNumber: {
    fontSize: 54,
    fontWeight: '800',
    color: '#2563EB',
  },
  peopleAhead: {
    color: '#475569',
  },
  yourTurnContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
  },
  yourTurnIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginBottom: 10,
  },
  yourTurnText: {
    fontWeight: '800',
    fontSize: 24,
    color: '#065F46',
  },
  yourTurnSubtext: {
    textAlign: 'center',
    color: '#065F46',
    marginTop: 6,
  },
  infoContainer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748B',
  },
  infoValue: {
    color: '#1E293B',
    fontWeight: '600',
    marginTop: 2,
  },
  leaveButton: {
    marginTop: 18,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  leaveButtonText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  queueInfoCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  queueInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  queueDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  queueDetailLabel: {
    color: '#64748B',
  },
  queueDetailValue: {
    color: '#1E293B',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  descriptionTitle: {
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  descriptionText: {
    color: '#475569',
    lineHeight: 20,
  },
});
