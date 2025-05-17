import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Copy, Circle as XCircle, ChevronRight, Bell, Users } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';

export default function ManageQueueScreen() {
  const { activeHostQueue, callNext, removePerson, endQueue } = useQueueContext();
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  
  if (!activeHostQueue) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#EFF6FF', '#F9FAFB']}
          style={styles.background}
        />
        
        <View style={styles.emptyContainer}>
          <Users size={60} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Active Queue</Text>
          <Text style={styles.emptyDescription}>
            You don't have any active queues to manage. Create a new queue to get started.
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
  
  const handleCallNext = () => {
    const nextPerson = callNext(activeHostQueue.id);
    if (nextPerson) {
      setSelectedPerson(nextPerson.id);
      // In a real app, this would send a notification to the user
      Alert.alert('Next Customer', `${nextPerson.name} has been notified that it's their turn.`);
    } else {
      Alert.alert('Queue Empty', 'There are no more people in the queue.');
    }
  };
  
  const handleRemovePerson = (personId: string) => {
    Alert.alert(
      'Remove from Queue',
      'Are you sure you want to remove this person from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removePerson(activeHostQueue.id, personId);
            if (selectedPerson === personId) {
              setSelectedPerson(null);
            }
          } 
        },
      ]
    );
  };
  
  const handleEndQueue = () => {
    Alert.alert(
      'End Queue',
      'Are you sure you want to end this queue? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Queue', 
          style: 'destructive',
          onPress: () => {
            endQueue(activeHostQueue.id);
            router.replace('/(tabs)/create');
          } 
        },
      ]
    );
  };
  
  const handleShareQueueCode = () => {
    // In a real app, this would use the Share API
    Alert.alert('Share Queue', `Your queue code is: ${activeHostQueue.id}`);
  };
  
  const handleCopyQueueCode = () => {
    // In a real app, this would copy to clipboard
    Alert.alert('Copied!', 'Queue code copied to clipboard');
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EFF6FF', '#F9FAFB']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Queue</Text>
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
              <TouchableOpacity 
                style={styles.codeAction}
                onPress={handleCopyQueueCode}
              >
                <Copy size={18} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.codeAction}
                onPress={handleShareQueueCode}
              >
                <Share2 size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.callNextButton}
          onPress={handleCallNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.callNextText}>Call Next Person</Text>
            <Bell size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.endQueueButton}
          onPress={handleEndQueue}
        >
          <Text style={styles.endQueueText}>End Queue</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>People in Queue</Text>
        
        {activeHostQueue.people.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>
              No one has joined the queue yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeHostQueue.people}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={[
                styles.personItem,
                selectedPerson === item.id && styles.selectedPersonItem
              ]}>
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
                  {selectedPerson === item.id && index === 0 && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextBadgeText}>Next</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemovePerson(item.id)}
                  >
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
  createButton: {
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  queueStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  queueStatLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  codeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  codeActions: {
    flexDirection: 'row',
  },
  codeAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  callNextButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callNextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  endQueueButton: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  endQueueText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  personList: {
    flex: 1,
  },
  personListContent: {
    paddingBottom: 20,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedPersonItem: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  personMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  personActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  nextBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 6,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});