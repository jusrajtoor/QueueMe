import React, { useState } from 'react';
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

export default function CreateQueueScreen() {
  const { createQueue } = useQueueContext();

  const [queueName, setQueueName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [timePerPerson, setTimePerPerson] = useState('5');
  const [useLocation, setUseLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateQueue = async () => {
    if (!queueName.trim()) {
      Alert.alert('Missing Information', 'Please enter a name for your queue.');
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <LinearGradient colors={['#EFF6FF', '#F9FAFB']} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Queue</Text>
        <View style={{ width: 24 }} />
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
              <Clock size={20} color="#3B82F6" />
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
              <MapPin size={20} color="#3B82F6" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Include Location</Text>
              <Switch
                value={useLocation}
                onValueChange={setUseLocation}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={useLocation ? '#3B82F6' : '#F9FAFB'}
              />
            </View>
          </View>

          {useLocation && (
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#94A3B8"
            />
          )}

          <View style={styles.infoBox}>
            <Info size={18} color="#64748B" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              This queue will be stored in the backend and available across all devices.
            </Text>
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
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Creating...' : 'Create Queue'}</Text>
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  smallInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    color: '#1E293B',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  createButton: {
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
