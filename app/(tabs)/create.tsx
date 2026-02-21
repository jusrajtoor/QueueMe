import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Clock, MapPin, Info } from 'lucide-react-native';
import { useQueueContext } from '@/context/QueueContext';
import { useAuth } from '@/context/AuthContext';
import { searchLocationSuggestions } from '@/utils/locationSearch';

export default function CreateQueueScreen() {
  const { createQueue } = useQueueContext();
  const { profile } = useAuth();

  const [queueName, setQueueName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<{ id: string; label: string }[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string | null>(null);
  const [timePerPerson, setTimePerPerson] = useState('5');
  const [useLocation, setUseLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (useLocation) {
      return;
    }

    setLocation('');
    setSelectedLocationId(null);
    setLocationSuggestions([]);
    setLocationSearchError(null);
    setIsSearchingLocations(false);
  }, [useLocation]);

  useEffect(() => {
    if (!useLocation) {
      return;
    }

    const query = location.trim();

    if (query.length < 3 || selectedLocationId) {
      setLocationSuggestions([]);
      setLocationSearchError(null);
      setIsSearchingLocations(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsSearchingLocations(true);
      setLocationSearchError(null);

      try {
        const suggestions = await searchLocationSuggestions(query, controller.signal);
        setLocationSuggestions(suggestions.map((item) => ({ id: item.id, label: item.label })));
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') {
          return;
        }

        setLocationSearchError('Could not load real addresses right now.');
        setLocationSuggestions([]);
      } finally {
        setIsSearchingLocations(false);
      }
    }, 320);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [location, selectedLocationId, useLocation]);

  if (profile?.role === 'customer') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />
        <View style={styles.modeBlockCard}>
          <Text style={styles.modeBlockTitle}>Customer mode is active</Text>
          <Text style={styles.modeBlockText}>
            Queue creation is available for business accounts. Switch your role in Profile to business.
          </Text>
          <TouchableOpacity style={styles.modeBlockButton} onPress={() => router.push('/(tabs)/profile' as never)}>
            <Text style={styles.modeBlockButtonText}>Open Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCreateQueue = async () => {
    if (!queueName.trim()) {
      Alert.alert('Missing Information', 'Please enter a name for your queue.');
      return;
    }

    if (useLocation && !location.trim()) {
      Alert.alert('Missing Information', 'Please add a queue location.');
      return;
    }

    if (useLocation && !selectedLocationId) {
      Alert.alert('Select a Real Address', 'Choose one of the suggested addresses so customers see a real location.');
      return;
    }

    setIsSubmitting(true);

    const queue = await createQueue({
      name: queueName.trim(),
      description: description.trim(),
      location: useLocation ? location.trim() : undefined,
      timePerPerson: parseInt(timePerPerson, 10) || 5,
    });

    setIsSubmitting(false);

    if (!queue) {
      Alert.alert('Failed to Create Queue', 'Please try again.');
      return;
    }

    router.push('/(tabs)/manage');
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setSelectedLocationId(null);
  };

  const handleSelectLocation = (suggestion: { id: string; label: string }) => {
    setLocation(suggestion.label);
    setSelectedLocationId(suggestion.id);
    setLocationSuggestions([]);
    setLocationSearchError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <LinearGradient colors={['#E2E8F0', '#F8FAFC']} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Queue</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.label}>Queue Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter queue name"
            value={queueName}
            onChangeText={setQueueName}
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Add details about your queue"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />

          <View style={styles.optionRow}>
            <View style={styles.iconContainer}>
              <Clock size={20} color="#1D4ED8" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Time Per Person (minutes)</Text>
              <TextInput
                style={styles.smallInput}
                value={timePerPerson}
                onChangeText={setTimePerPerson}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.optionRow}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color="#1D4ED8" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Include Location</Text>
              <Switch
                value={useLocation}
                onValueChange={setUseLocation}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={useLocation ? '#1D4ED8' : '#F9FAFB'}
              />
            </View>
          </View>

          {useLocation ? (
            <View style={styles.locationContainer}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="Search and choose a real address"
                value={location}
                onChangeText={handleLocationChange}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.locationHint}>
                Start typing at least 3 characters and choose a suggested address.
              </Text>

              {isSearchingLocations ? <Text style={styles.locationStatus}>Finding addresses...</Text> : null}
              {locationSearchError ? <Text style={styles.locationError}>{locationSearchError}</Text> : null}

              {locationSuggestions.length > 0 ? (
                <View style={styles.suggestionsContainer}>
                  {locationSuggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectLocation(suggestion)}
                    >
                      <MapPin size={15} color="#475569" />
                      <Text style={styles.suggestionText}>{suggestion.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.infoBox}>
            <Info size={18} color="#475569" style={styles.infoIcon} />
            <Text style={styles.infoText}>Your queue will sync instantly for all joined customers.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isSubmitting && { opacity: 0.6 }]}
          onPress={handleCreateQueue}
          activeOpacity={0.9}
          disabled={isSubmitting}
        >
          <LinearGradient colors={['#1D4ED8', '#2563EB']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Creating...' : 'Create Queue'}</Text>
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  formContainer: { marginTop: 8 },
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
  locationContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  locationInput: {
    marginBottom: 8,
  },
  locationHint: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 8,
  },
  locationStatus: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 8,
  },
  locationError: {
    color: '#B91C1C',
    fontSize: 13,
    marginBottom: 8,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    color: '#334155',
    fontSize: 13,
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  smallInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    width: 58,
    textAlign: 'center',
    fontSize: 15,
    color: '#1E293B',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  infoIcon: { marginTop: 2, marginRight: 10 },
  infoText: { flex: 1, color: '#475569', lineHeight: 20 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  createButton: { height: 54, borderRadius: 12, overflow: 'hidden' },
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
