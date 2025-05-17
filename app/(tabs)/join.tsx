import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, QrCode, Ticket } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';

export default function JoinQueueScreen() {
  const { queues, joinQueue } = useQueueContext();
  
  const [queueCode, setQueueCode] = useState('');
  const [userName, setUserName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState(1);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  
  const handleFindQueue = () => {
    if (!queueCode.trim()) {
      Alert.alert('Missing Information', 'Please enter a queue code.');
      return;
    }
    
    const queue = queues.find(q => q.id === queueCode.trim() && q.isActive);
    
    if (!queue) {
      Alert.alert('Queue Not Found', 'Please check the code and try again.');
      return;
    }
    
    setSelectedQueue(queue.id);
    setStep(2);
  };
  
  const handleJoinQueue = () => {
    if (!userName.trim()) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return;
    }
    
    if (!selectedQueue) return;
    
    const success = joinQueue(selectedQueue, userName.trim(), contactInfo.trim() || undefined);
    
    if (success) {
      router.push('/(tabs)/status');
    } else {
      Alert.alert('Error', 'Could not join the queue. This may be because the queue is no longer active or you may already be in this queue.');
    }
  };
  
  const selectedQueueData = selectedQueue ? queues.find(q => q.id === selectedQueue) : null;
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <LinearGradient
        colors={['#EFF6FF', '#F9FAFB']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => step === 1 ? router.back() : setStep(1)}
        >
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'Join a Queue' : 'Enter Your Details'}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <View style={styles.formContainer}>
            <View style={styles.codeInputContainer}>
              <View style={styles.codeInputHeader}>
                <Ticket size={20} color="#3B82F6" />
                <Text style={styles.codeInputLabel}>Queue Code</Text>
              </View>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter the queue code"
                value={queueCode}
                onChangeText={setQueueCode}
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <TouchableOpacity style={styles.qrButton}>
              <View style={styles.qrButtonContent}>
                <QrCode size={20} color="#3B82F6" />
                <Text style={styles.qrButtonText}>Scan QR Code</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.infoText}>
              Enter the queue code provided by the business or service you're visiting.
            </Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.queueInfoCard}>
              <Text style={styles.queueName}>{selectedQueueData?.name}</Text>
              {selectedQueueData?.description && (
                <Text style={styles.queueDescription}>{selectedQueueData.description}</Text>
              )}
              <View style={styles.queueDetailRow}>
                <Text style={styles.queueDetailLabel}>People in line:</Text>
                <Text style={styles.queueDetailValue}>{selectedQueueData?.people.length || 0}</Text>
              </View>
              <View style={styles.queueDetailRow}>
                <Text style={styles.queueDetailLabel}>Est. wait time:</Text>
                <Text style={styles.queueDetailValue}>
                  {((selectedQueueData?.people.length || 0) * (selectedQueueData?.timePerPerson || 5))} mins
                </Text>
              </View>
            </View>
            
            <Text style={styles.label}>Your Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={userName}
              onChangeText={setUserName}
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
            />
            
            <Text style={styles.label}>Contact Info (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone or email"
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={step === 1 ? handleFindQueue : handleJoinQueue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={step === 1 ? ['#3B82F6', '#2563EB'] : ['#10B981', '#059669']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {step === 1 ? 'Find Queue' : 'Join Queue'}
            </Text>
          </LinearGradient>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formContainer: {
    marginTop: 20,
  },
  codeInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  codeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  codeInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  codeInput: {
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  qrButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  qrButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  queueInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  queueName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  queueDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  queueDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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