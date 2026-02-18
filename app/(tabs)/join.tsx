import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';

export default function JoinQueueScreen() {
  const { queues, joinQueue, isLoading } = useQueueContext();
  const { profile } = useAuth();

  const [queueCode, setQueueCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState(1);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!displayName && profile?.fullName) {
      setDisplayName(profile.fullName);
    }
  }, [profile?.fullName, displayName]);

  if (profile?.role === 'business') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />
        <View style={styles.modeBlockCard}>
          <Text style={styles.modeBlockTitle}>Business mode is active</Text>
          <Text style={styles.modeBlockText}>
            Join flow is for customers. Switch your role in Profile to customer when you want to join queues.
          </Text>
          <TouchableOpacity style={styles.modeBlockButton} onPress={() => router.push('/(tabs)/profile' as never)}>
            <Text style={styles.modeBlockButtonText}>Open Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
      Alert.alert('Missing Information', 'Please add your name in profile or enter it here.');
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
      <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step === 1 ? router.back() : setStep(1))}
        >
          <ArrowLeft size={22} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 1 ? 'Join Queue' : 'Your Details'}</Text>
        <View style={{ width: 38 }} />
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
                <Ticket size={20} color="#1D4ED8" />
                <Text style={styles.codeInputLabel}>Queue Code</Text>
              </View>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter queue code"
                value={queueCode}
                onChangeText={(value) => setQueueCode(value.toUpperCase())}
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.qrButton} disabled>
              <View style={styles.qrButtonContent}>
                <QrCode size={20} color="#1D4ED8" />
                <Text style={styles.qrButtonText}>Scan QR (coming soon)</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.infoText}>Use the code shared by the business to find your queue.</Text>
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
            colors={step === 1 ? ['#1D4ED8', '#2563EB'] : ['#059669', '#10B981']}
            style={styles.buttonGradient}
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  formContainer: { marginTop: 8 },
  codeInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  codeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  codeInputLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginLeft: 10 },
  codeInput: { padding: 14, fontSize: 16, color: '#1E293B' },
  qrButton: { backgroundColor: '#DBEAFE', borderRadius: 12, padding: 14, marginBottom: 14 },
  qrButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  qrButtonText: { color: '#1D4ED8', fontWeight: '700', marginLeft: 8 },
  infoText: { color: '#475569', lineHeight: 20 },
  queueInfoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  queueName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  queueDescription: { color: '#64748B', marginBottom: 8 },
  queueDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  queueDetailLabel: { color: '#64748B' },
  queueDetailValue: { color: '#0F172A', fontWeight: '700' },
  label: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  actionButton: { height: 54, borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modeBlockCard: {
    marginTop: 140,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
  },
  modeBlockTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modeBlockText: { marginTop: 8, color: '#475569', lineHeight: 21 },
  modeBlockButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeBlockButtonText: { color: '#1D4ED8', fontWeight: '700' },
});
