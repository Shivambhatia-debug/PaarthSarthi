import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api/axios';
import colors from '../../constants/colors';
import MeetingCard from '../../components/MeetingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MyMeetingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await api.get('/meetings/my?limit=100');
      setMeetings(res.data?.meetings || []);
    } catch (e) {
      console.error('Error fetching meetings:', e);
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

  const handleCancel = (meeting) => {
    Alert.alert(
      'Cancel Meeting',
      'Are you sure you want to cancel this meeting?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/meetings/${meeting._id}/cancel`, {
                cancelReason: 'Cancelled by user',
              });
              setMeetings(prev =>
                prev.map(m => m._id === meeting._id ? { ...m, status: 'cancelled' } : m)
              );
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to cancel meeting');
            }
          },
        },
      ]
    );
  };

  const handleFeedback = (meeting) => {
    Alert.prompt
      ? Alert.prompt('Feedback', 'Rate your session (1-5):', (text) => {
          const rating = parseInt(text);
          if (rating >= 1 && rating <= 5) {
            submitFeedback(meeting._id, rating);
          }
        })
      : submitFeedback(meeting._id, 5); // Fallback for Android
  };

  const submitFeedback = async (meetingId, rating) => {
    try {
      await api.put(`/meetings/${meetingId}/feedback`, { rating, feedback: 'Great session!' });
      setMeetings(prev =>
        prev.map(m => m._id === meetingId ? { ...m, rating } : m)
      );
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit feedback');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Meetings</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={meetings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeetings(); }} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <MeetingCard
              meeting={item}
              onCancel={handleCancel}
              onFeedback={handleFeedback}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Meetings Yet"
              message="Book a session with a mentor to get started"
            />
          }
        />
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  list: {
    padding: 20,
  },
});

export default MyMeetingsScreen;
