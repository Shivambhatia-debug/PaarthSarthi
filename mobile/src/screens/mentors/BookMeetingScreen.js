import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { formatDate } from '../../utils/helpers';

const DURATIONS = [15, 30, 45, 60];
const MEETING_TYPES = [
  { key: 'video', icon: 'videocam-outline', label: 'Video Call' },
  { key: 'audio', icon: 'call-outline', label: 'Audio Call' },
  { key: 'in-person', icon: 'location-outline', label: 'In-Person' },
];

const BookMeetingScreen = ({ route, navigation }) => {
  const { mentor } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    subject: '',
    description: '',
    date: new Date(Date.now() + 86400000), // tomorrow
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    meetingType: 'video',
  });

  const updateForm = (key, value) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      // Auto-calculate end time when start time or duration changes
      if (key === 'startTime' || key === 'duration') {
        const st = key === 'startTime' ? value : prev.startTime;
        const dur = key === 'duration' ? value : prev.duration;
        const [h, m] = st.split(':').map(Number);
        const totalMins = h * 60 + m + dur;
        const endH = Math.floor(totalMins / 60) % 24;
        const endM = totalMins % 60;
        updated.endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }
      return updated;
    });
  };

  const TIME_SLOTS = [];
  for (let h = 9; h <= 20; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
  }

  const handleBooking = async () => {
    if (!form.subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    setLoading(true);
    try {
      await api.post('/meetings', {
        userName: user?.name || 'Student',
        userEmail: user?.email || '',
        userPhone: user?.phone || '',
        user: user?.id || user?._id,
        meetingWith: 'mentor',
        mentor: mentor._id,
        mentorId: mentor._id,
        meetingPersonName: mentor.name,
        subject: form.subject,
        description: form.description,
        date: form.date.toISOString(),
        timeSlot: {
          startTime: form.startTime,
          endTime: form.endTime,
        },
        duration: form.duration,
        meetingType: form.meetingType,
        amount: 0,
      });

      Alert.alert(
        'Booking Confirmed! 🎉',
        'Your session has been booked. You will receive a confirmation soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to book meeting');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) updateForm('date', selectedDate);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Session</Text>
          <Text style={styles.headerSubtitle}>with {mentor.name}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Subject */}
          <Text style={styles.label}>Subject *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g., Career guidance for engineering"
              placeholderTextColor={colors.textLight}
              value={form.subject}
              onChangeText={(t) => updateForm('subject', t)}
            />
          </View>

          {/* Description */}
          <Text style={styles.label}>Description (optional)</Text>
          <View style={[styles.inputContainer, { height: 100 }]}>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Tell us more about what you'd like to discuss..."
              placeholderTextColor={colors.textLight}
              value={form.description}
              onChangeText={(t) => updateForm('description', t)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateText}>{formatDate(form.date)}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date(Date.now() + 86400000)}
              onChange={onDateChange}
            />
          )}

          {/* Time Slot */}
          <Text style={styles.label}>Time Slot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
            <View style={styles.timeRow}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, form.startTime === slot && styles.timeChipActive]}
                  onPress={() => updateForm('startTime', slot)}
                >
                  <Text style={[styles.timeText, form.startTime === slot && styles.timeTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Duration */}
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[styles.durationChip, form.duration === dur && styles.durationChipActive]}
                onPress={() => updateForm('duration', dur)}
              >
                <Text style={[styles.durationText, form.duration === dur && styles.durationTextActive]}>
                  {dur} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meeting Type */}
          <Text style={styles.label}>Meeting Type</Text>
          <View style={styles.typeRow}>
            {MEETING_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.typeCard, form.meetingType === type.key && styles.typeCardActive]}
                onPress={() => updateForm('meetingType', type.key)}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={form.meetingType === type.key ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.typeLabel, form.meetingType === type.key && styles.typeLabelActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mentor</Text>
              <Text style={styles.summaryValue}>{mentor.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{formatDate(form.date)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{form.startTime} - {form.endTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{form.duration} minutes</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price</Text>
              <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: '800' }]}>
                {'Free'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity onPress={handleBooking} disabled={loading} activeOpacity={0.85} style={{ flex: 1 }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.bookBtn, loading && { opacity: 0.7 }]}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.bookBtnText}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  input: {
    height: 50,
    fontSize: 15,
    color: colors.textPrimary,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  timeScroll: {
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  timeChipActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timeTextActive: {
    color: colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationTextActive: {
    color: colors.primary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  typeCardActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeLabelActive: {
    color: colors.primary,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
    elevation: 2,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    elevation: 10,
  },
  bookBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});

export default BookMeetingScreen;
