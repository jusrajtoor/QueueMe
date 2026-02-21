import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Copy, Circle as XCircle, ChevronRight, Bell, Users } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';
import { ProfileMenuButton } from '@/components/ProfileMenuButton';

export default function ManageQueueScreen() {
  const { activeHostQueue, callNext, removePerson, endQueue, isLoading } = useQueueContext();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  if (!activeHostQueue && !isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Manage Queue</Text>
          <ProfileMenuButton />
        </View>

        <View style={styles.emptyContainer}>
          <Users size={60} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Active Queue</Text>
          <Text style={styles.emptyDescription}>
            You do not have any active queues to manage. Create a new queue to get started.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Create a Queue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!activeHostQueue) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Manage Queue</Text>
          <ProfileMenuButton />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyDescription}>Loading your queue...</Text>
        </View>
      </View>
    );
  }

  const handleCallNext = async () => {
    setIsMutating(true);
    const nextPerson = await callNext(activeHostQueue.id);
    setIsMutating(false);

    if (nextPerson) {
      setSelectedPerson(nextPerson.id);
      Alert.alert('Next Customer', `${nextPerson.name} has been marked as served.`);
    } else {
      Alert.alert('Queue Empty', 'There are no more people in the queue.');
    }
  };

  const handleRemovePerson = (personId: string) => {
    Alert.alert('Remove from Queue', 'Are you sure you want to remove this person from the queue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setIsMutating(true);
          await removePerson(activeHostQueue.id, personId);
          setIsMutating(false);

          if (selectedPerson === personId) {
            setSelectedPerson(null);
          }
        },
      },
    ]);
  };

  const executeEndQueue = async () => {
    setIsMutating(true);
    const result = await endQueue(activeHostQueue.id);
    setIsMutating(false);

    if (!result.success) {
      Alert.alert('Could Not End Queue', result.message ?? 'Please try again.');
      return;
    }

    Alert.alert('Queue Ended', 'Your queue has been closed successfully.');
    router.replace('/(tabs)');
  };

  const handleEndQueue = () => {
    const confirmationMessage = 'Are you sure you want to end this queue? This cannot be undone.';

    if (Platform.OS === 'web') {
      const confirmFn = (globalThis as { confirm?: (message?: string) => boolean }).confirm;
      const confirmed = confirmFn ? confirmFn(confirmationMessage) : true;

      if (!confirmed) {
        return;
      }

      void executeEndQueue();
      return;
    }

    Alert.alert('End Queue', confirmationMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Queue',
        style: 'destructive',
        onPress: () => {
          void executeEndQueue();
        },
      },
    ]);
  };

  const handleShareQueueCode = () => {
    Alert.alert('Share Queue', `Your queue code is: ${activeHostQueue.id}`);
  };

  const handleCopyQueueCode = () => {
    Alert.alert('Copied!', 'Queue code copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />

      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Manage Queue</Text>
        <ProfileMenuButton />
      </View>

      <View style={styles.queueInfoCard}>
        <Text style={styles.queueName}>{activeHostQueue.name}</Text>

        <View style={styles.queueStatsRow}>
          <View style={styles.queueStat}>
            <Text style={styles.queueStatValue}>{activeHostQueue.people.length}</Text>
            <Text style={styles.queueStatLabel}>In Queue</Text>
          </View>

          <View style={styles.queueStat}>
            <Text style={styles.queueStatValue}>
              {activeHostQueue.people.length * activeHostQueue.timePerPerson} min
            </Text>
            <Text style={styles.queueStatLabel}>Est. Wait Time</Text>
          </View>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Queue Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{activeHostQueue.id}</Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeAction} onPress={handleCopyQueueCode}>
                <Copy size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.codeAction} onPress={handleShareQueueCode}>
                <Share2 size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.callNextButton, isMutating && { opacity: 0.6 }]}
          onPress={handleCallNext}
          activeOpacity={0.8}
          disabled={isMutating}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.callNextText}>{isMutating ? 'Working...' : 'Call Next Person'}</Text>
            <Bell size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.endQueueButton, isMutating && { opacity: 0.6 }]}
          onPress={handleEndQueue}
          disabled={isMutating}
        >
          <Text style={styles.endQueueText}>End Queue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>People in Queue</Text>

        {activeHostQueue.people.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>No one has joined the queue yet.</Text>
          </View>
        ) : (
          <FlatList
            data={activeHostQueue.people}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={[styles.personItem, selectedPerson === item.id && styles.selectedPersonItem]}>
                <View style={styles.personInfo}>
                  <View style={styles.personPosition}>
                    <Text style={styles.positionText}>{index + 1}</Text>
                  </View>
                  <View style={styles.personDetails}>
                    <Text style={styles.personName}>{item.name}</Text>
                    <Text style={styles.personMeta}>
                      Joined {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.personActions}>
                  {selectedPerson === item.id && index === 0 ? (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>Next</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemovePerson(item.id)}>
                    <XCircle size={22} color="#EF4444" />
                  </TouchableOpacity>
                  <ChevronRight size={20} color="#94A3B8" />
                </View>
              </View>
            )}
            style={styles.personList}
            contentContainerStyle={styles.personListContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  createButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  queueInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  queueStatsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  queueStat: {
    flex: 1,
    alignItems: 'center',
  },
  queueStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  queueStatLabel: {
    color: '#64748B',
    marginTop: 4,
  },
  codeContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  codeLabel: {
    color: '#64748B',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#1E293B',
  },
  codeActions: {
    flexDirection: 'row',
  },
  codeAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginLeft: 8,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  callNextButton: {
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callNextText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  endQueueButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  endQueueText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 16,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: '#64748B',
  },
  personList: {
    flex: 1,
  },
  personListContent: {
    paddingBottom: 20,
  },
  personItem: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPersonItem: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personPosition: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  positionText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  personMeta: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 12,
  },
  personActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  nextBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  removeButton: {
    padding: 4,
    marginRight: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
