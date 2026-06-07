import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axios';
import colors from '../../constants/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MentorScheduleScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await api.get('/meetings/my?limit=50');
      setMeetings(response.data?.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMeetings();
    });
    return unsubscribe;
  }, [navigation, fetchMeetings]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'completed': return colors.info;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const renderMeeting = ({ item }) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
          <Text style={styles.dateMonth}>
            {new Date(item.date).toLocaleString('default', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.meetingInfo}>
          <Text style={styles.meetingSubject} numberOfLines={1}>{item.subject}</Text>
          <Text style={styles.meetingWith}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} />{' '}
            {item.userName || 'Student'}
          </Text>
          <Text style={styles.meetingTime}>
            <Ionicons name="time-outline" size={12} color={colors.textLight} />{' '}
            {item.timeSlot?.startTime} - {item.timeSlot?.endTime}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {item.meetingType && (
        <View style={styles.meetingMeta}>
          <View style={styles.metaChip}>
            <Ionicons
              name={item.meetingType === 'video' ? 'videocam' : item.meetingType === 'audio' ? 'call' : 'location'}
              size={12}
              color={colors.primary}
            />
            <Text style={styles.metaText}>{item.meetingType}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="hourglass-outline" size={12} color={colors.primary} />
            <Text style={styles.metaText}>{item.duration || 30} min</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) return <LoadingSpinner message="Loading schedule..." />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 My Schedule</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={meetings}
        keyExtractor={(item) => item._id}
        renderItem={renderMeeting}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeetings(); }} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No sessions scheduled"
            message="Students will book sessions with you soon!"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  meetingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    backgroundColor: colors.primaryFaded,
    borderRadius: 12,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  meetingWith: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  meetingTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  meetingMeta: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  metaText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
});

export default MentorScheduleScreen;
