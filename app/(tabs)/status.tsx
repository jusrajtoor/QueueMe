import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Clock, MapPin, LogOut, Check } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';

export default function QueueStatusScreen() {
  const { currentQueue, userPosition, userName, leaveQueue } = useQueueContext();
  const [isYourTurn, setIsYourTurn] = useState(false);
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    // Check if it's the user's turn (they're first in line)
    if (userPosition === 1 && !isYourTurn) {
      setIsYourTurn(true);
      // Trigger animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 2 }),
        withDelay(200, withSpring(1))
      );
      
      // In a real app, this would also trigger a notification
    }
  }, [userPosition, isYourTurn]);
  
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  const handleLeaveQueue = () => {
    if (!currentQueue || !userName) return;
    
    Alert.alert(
      'Leave Queue',
      'Are you sure you want to leave the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            const personId = currentQueue.people.find(p => p.name === userName)?.id;
            if (personId) {
              leaveQueue(currentQueue.id, personId);
              router.replace('/(tabs)/');
            }
          } 
        },
      ]
    );
  };
  
  if (!currentQueue || !userName) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#EFF6FF', '#F9FAFB']}
          style={styles.background}
        />
        
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
  
  // Calculate estimated wait time
  const waitTimeMinutes = (userPosition && userPosition > 0)
    ? (userPosition - 1) * (currentQueue.timePerPerson || 5)
    : 0;
  
  // Calculate time when it will be the user's turn
  const turnTime = new Date();
  turnTime.setMinutes(turnTime.getMinutes() + waitTimeMinutes);
  const turnTimeString = turnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EFF6FF', '#F9FAFB']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Queue Status</Text>
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
              <Text style={styles.yourTurnText}>It's Your Turn!</Text>
              <Text style={styles.yourTurnSubtext}>
                Please proceed to the counter. The staff is ready to assist you.
              </Text>
            </View>
          ) : (
            <View style={styles.positionContainer}>
              <Text style={styles.positionLabel}>Your Position</Text>
              <Text style={styles.positionNumber}>{userPosition}</Text>
              <Text style={styles.peopleAhead}>
                {userPosition === 1 
                  ? 'You are next!'
                  : `${userPosition - 1} ${userPosition - 1 === 1 ? 'person' : 'people'} ahead of you`
                }
              </Text>
            </View>
          )}
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Clock size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {isYourTurn ? 'Ready Now' : 'Estimated Wait Time'}
                </Text>
                <Text style={styles.infoValue}>
                  {isYourTurn 
                    ? '0 minutes' 
                    : waitTimeMinutes > 0
                      ? `${waitTimeMinutes} minutes (around ${turnTimeString})`
                      : 'Less than a minute'
                  }
                </Text>
              </View>
            </View>
            
            {currentQueue.location && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={20} color="#3B82F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{currentQueue.location}</Text>
                </View>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeaveQueue}
          >
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
            <Text style={styles.queueDetailValue}>{userName}</Text>
          </View>
          
          <View style={styles.queueDetailRow}>
            <Text style={styles.queueDetailLabel}>Joined at</Text>
            <Text style={styles.queueDetailValue}>
              {new Date(currentQueue.people.find(p => p.name === userName)?.joinedAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          {currentQueue.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{currentQueue.description}</Text>
            </View>
          )}
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  positionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  positionLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  positionNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  peopleAhead: {
    fontSize: 16,
    color: '#64748B',
  },
  yourTurnContainer: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  yourTurnIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  yourTurnText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  yourTurnSubtext: {
    fontSize: 14,
    color: '#064E3B',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  queueInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  queueDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  queueDetailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  queueDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});