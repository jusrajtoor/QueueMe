import React, { useEffect, useMemo, useState } from 'react';
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
import { ArrowLeft, Building2, MapPin, Search, Ticket } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';
import { useAuth } from '@/context/AuthContext';

export default function JoinQueueScreen() {
  const { queues, joinQueue, isLoading } = useQueueContext();
  const { profile } = useAuth();

  const [queueCode, setQueueCode] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
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

  const activeQueues = useMemo(() => queues.filter((queue) => queue.isActive), [queues]);

  const filteredQueues = useMemo(() => {
    const companyQuery = searchCompany.trim().toLowerCase();
    const locationQuery = searchLocation.trim().toLowerCase();

    return activeQueues
      .filter((queue) => {
        const queueName = queue.name.toLowerCase();
        const queueDescription = (queue.description ?? '').toLowerCase();
        const queueLocation = (queue.location ?? '').toLowerCase();

        const companyMatches =
          !companyQuery || queueName.includes(companyQuery) || queueDescription.includes(companyQuery);
        const locationMatches = !locationQuery || queueLocation.includes(locationQuery);

        return companyMatches && locationMatches;
      })
      .sort((a, b) => a.people.length - b.people.length)
      .slice(0, 20);
  }, [activeQueues, searchCompany, searchLocation]);

  const hasSearchFilters = searchCompany.trim().length > 0 || searchLocation.trim().length > 0;

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

  const handleFindQueueByCode = () => {
    if (!queueCode.trim()) {
      Alert.alert('Missing Information', 'Please enter a queue code.');
      return;
    }

    const queue = activeQueues.find((q) => q.id === queueCode.trim().toUpperCase());

    if (!queue) {
      Alert.alert('Queue Not Found', 'Please check the code and try again.');
      return;
    }

    setSelectedQueue(queue.id);
    setStep(2);
  };

  const handleSelectQueue = (queueId: string) => {
    setSelectedQueue(queueId);
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
        <TouchableOpacity style={styles.backButton} onPress={() => (step === 1 ? router.back() : setStep(1))}>
          <ArrowLeft size={22} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 1 ? 'Find Queue' : 'Your Details'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <View style={styles.formContainer}>
            <View style={styles.searchContainer}>
              <View style={styles.searchHeader}>
                <Search size={20} color="#1D4ED8" />
                <Text style={styles.searchTitle}>Search by Company or Location</Text>
              </View>

              <View style={styles.searchInputRow}>
                <Building2 size={18} color="#1D4ED8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Business or service name"
                  value={searchCompany}
                  onChangeText={setSearchCompany}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.searchInputRow}>
                <MapPin size={18} color="#1D4ED8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Location (city, address, area)"
                  value={searchLocation}
                  onChangeText={setSearchLocation}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <Text style={styles.searchHelperText}>
              {hasSearchFilters
                ? `Showing ${filteredQueues.length} matching queue${filteredQueues.length === 1 ? '' : 's'}.`
                : 'Showing active queues. Add filters to narrow results.'}
            </Text>

            {filteredQueues.length === 0 ? (
              <View style={styles.emptySearchState}>
                <Text style={styles.emptySearchText}>No active queues matched your search.</Text>
              </View>
            ) : (
              <View style={styles.searchResultsContainer}>
                {filteredQueues.map((queue) => {
                  const estimatedWait = queue.people.length * queue.timePerPerson;

                  return (
                    <TouchableOpacity
                      key={queue.id}
                      style={styles.queueResultCard}
                      onPress={() => handleSelectQueue(queue.id)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.queueResultHeader}>
                        <Text style={styles.queueResultName}>{queue.name}</Text>
                        <Text style={styles.queueResultCode}>{queue.id}</Text>
                      </View>

                      {queue.location ? (
                        <View style={styles.queueResultLocationRow}>
                          <MapPin size={14} color="#64748B" />
                          <Text style={styles.queueResultLocation}>{queue.location}</Text>
                        </View>
                      ) : null}

                      <View style={styles.queueResultStats}>
                        <Text style={styles.queueResultMeta}>{queue.people.length} in line</Text>
                        <Text style={styles.queueResultMeta}>
                          Est. wait {estimatedWait > 0 ? `${estimatedWait} min` : 'Less than a min'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.codeInputContainer}>
              <View style={styles.codeInputHeader}>
                <Ticket size={20} color="#1D4ED8" />
                <Text style={styles.codeInputLabel}>Have a Queue Code?</Text>
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

            <Text style={styles.infoText}>
              Tap a queue from search results, or use a direct code from the business.
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
              {selectedQueueData?.location ? <Text style={styles.queueLocation}>{selectedQueueData.location}</Text> : null}
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
          onPress={step === 1 ? handleFindQueueByCode : handleJoinQueue}
          activeOpacity={0.9}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={step === 1 ? ['#1D4ED8', '#2563EB'] : ['#059669', '#10B981']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Joining...' : step === 1 ? 'Find by Code' : 'Join Queue'}
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    padding: 14,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 10,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    color: '#1E293B',
    fontSize: 15,
  },
  searchHelperText: {
    color: '#475569',
    marginTop: 10,
    marginBottom: 10,
    lineHeight: 20,
  },
  searchResultsContainer: {
    marginBottom: 14,
    gap: 10,
  },
  queueResultCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
  },
  queueResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueResultName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  queueResultCode: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  queueResultLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  queueResultLocation: {
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
  },
  queueResultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  queueResultMeta: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
  emptySearchState: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  emptySearchText: {
    color: '#64748B',
  },
  codeInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 14,
    marginBottom: 12,
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
  queueLocation: { color: '#1E293B', marginBottom: 8, fontWeight: '600' },
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
