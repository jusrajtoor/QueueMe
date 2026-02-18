import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, QrCode, Ticket } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';

export default function JoinQueueScreen() {
  const { queues, joinQueue, isLoading } = useQueueContext();

  const [queueCode, setQueueCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState(1);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFindQueue = () => {
    if (!queueCode.trim()) {
      Alert.alert('Missing Information', 'Please enter a queue code.');
      return;
    }

    const queue = queues.find((q) => q.id === queueCode.trim().toUpperCase() && q.isActive);

    if (!queue) {
      Alert.alert('Queue Not Found', 'Please check the code and try again.');
      return;
    }

    setSelectedQueue(queue.id);
    setStep(2);
  };

  const handleJoinQueue = async () => {
    if (!displayName.trim()) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return;
    }

    if (!selectedQueue) {
      return;
    }

    setIsSubmitting(true);

    const result = await joinQueue(selectedQueue, displayName.trim(), contactInfo.trim() || undefined);

    setIsSubmitting(false);

    if (result.success) {
      router.push('/(tabs)/status');
      return;
    }

    Alert.alert('Could Not Join Queue', result.message ?? 'Please try again.');
  };

  const selectedQueueData = selectedQueue ? queues.find((q) => q.id === selectedQueue) : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step === 1 ? router.back() : setStep(1))}
        >
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 1 ? 'Join a Queue' : 'Enter Your Details'}</Text>
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
                onChangeText={(value) => setQueueCode(value.toUpperCase())}
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.qrButton} disabled>
              <View style={styles.qrButtonContent}>
                <QrCode size={20} color="#3B82F6" />
                <Text style={styles.qrButtonText}>Scan QR Code (Coming Soon)</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Enter the queue code provided by the business or service you are visiting.
            </Text>
            {isLoading ? <Text style={styles.infoText}>Refreshing queue data...</Text> : null}
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.queueInfoCard}>
              <Text style={styles.queueName}>{selectedQueueData?.name}</Text>
              {selectedQueueData?.description ? (
                <Text style={styles.queueDescription}>{selectedQueueData.description}</Text>
              ) : null}
              <View style={styles.queueDetailRow}>
                <Text style={styles.queueDetailLabel}>People in line:</Text>
                <Text style={styles.queueDetailValue}>{selectedQueueData?.people.length || 0}</Text>
              </View>
              <View style={styles.queueDetailRow}>
                <Text style={styles.queueDetailLabel}>Est. wait time:</Text>
                <Text style={styles.queueDetailValue}>
                  {(selectedQueueData?.people.length || 0) * (selectedQueueData?.timePerPerson || 5)} mins
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Your Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
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
          style={[styles.actionButton, isSubmitting && { opacity: 0.6 }]}
          onPress={step === 1 ? handleFindQueue : handleJoinQueue}
          activeOpacity={0.9}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={step === 1 ? ['#3B82F6', '#2563EB'] : ['#10B981', '#059669']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Joining...' : step === 1 ? 'Find Queue' : 'Join Queue'}
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
    marginLeft: 10,
  },
  infoText: {
    color: '#64748B',
    lineHeight: 20,
  },
  queueInfoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  queueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  queueDescription: {
    color: '#64748B',
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
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
