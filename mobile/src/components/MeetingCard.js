import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { formatDate, formatTime, getStatusColor } from '../utils/helpers';

const MeetingCard = ({ meeting, onCancel, onFeedback }) => {
  const {
    meetingWith,
    meetingPersonName,
    subject,
    date,
    timeSlot,
    duration,
    meetingType,
    status,
    rating,
  } = meeting;

  const statusColor = getStatusColor(status);

  const getMeetingIcon = () => {
    switch (meetingType) {
      case 'video': return 'videocam-outline';
      case 'audio': return 'call-outline';
      case 'in-person': return 'location-outline';
      default: return 'videocam-outline';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <View style={[styles.typeIcon, { backgroundColor: meetingWith === 'mentor' ? colors.primaryFaded : colors.infoLight }]}>
            <Ionicons
              name={meetingWith === 'mentor' ? 'school-outline' : 'people-outline'}
              size={18}
              color={meetingWith === 'mentor' ? colors.primary : colors.info}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.subject} numberOfLines={1}>{subject}</Text>
            <Text style={styles.person}>
              {meetingWith === 'mentor' ? 'Mentor' : 'Alumni'}: {meetingPersonName || 'TBD'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {formatTime(timeSlot?.startTime)} - {formatTime(timeSlot?.endTime)} ({duration} min)
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name={getMeetingIcon()} size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{meetingType?.charAt(0).toUpperCase() + meetingType?.slice(1)} Call</Text>
        </View>
      </View>

      {(status === 'pending' || status === 'confirmed') && onCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(meeting)}>
          <Ionicons name="close-circle-outline" size={16} color={colors.error} />
          <Text style={styles.cancelText}>Cancel Meeting</Text>
        </TouchableOpacity>
      )}

      {status === 'completed' && !rating && onFeedback && (
        <TouchableOpacity style={styles.feedbackBtn} onPress={() => onFeedback(meeting)}>
          <Ionicons name="star-outline" size={16} color={colors.secondary} />
          <Text style={styles.feedbackText}>Give Feedback</Text>
        </TouchableOpacity>
      )}

      {rating > 0 && (
        <View style={styles.ratedRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={16} color={colors.star} />
          ))}
          <Text style={styles.ratedText}>Rated</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  subject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  person: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  details: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.errorLight,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.warningLight,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryDark,
  },
  ratedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 12,
    justifyContent: 'center',
  },
  ratedText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});

export default MeetingCard;
