import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { getInitials } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const MentorDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    todaySessions: 0,
    totalStudents: 0,
    rating: 0,
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [meetingsRes, blogsRes, notifRes] = await Promise.allSettled([
        api.get('/meetings?status=confirmed&limit=5'),
        api.get('/blogs/my/list?limit=3'),
        api.get('/notifications/unread-count'),
      ]);

      if (meetingsRes.status === 'fulfilled') {
        const meetings = meetingsRes.value.data?.meetings || [];
        setUpcomingMeetings(meetings.slice(0, 3));
        setStats(prev => ({
          ...prev,
          totalSessions: meetings.length,
          todaySessions: meetings.filter(m => {
            const today = new Date().toDateString();
            return new Date(m.date).toDateString() === today;
          }).length,
        }));
      }

      if (blogsRes.status === 'fulfilled') {
        setMyBlogs(blogsRes.value.data?.blogs || []);
      }

      if (notifRes.status === 'fulfilled') {
        setUnreadCount(notifRes.value.data?.unreadCount || 0);
      }

      // Get mentor profile stats if available
      if (user?.mentorProfile) {
        try {
          const mentorRes = await api.get('/auth/me');
          const mentorData = mentorRes.data?.user?.mentorProfile;
          if (mentorData) {
            setStats(prev => ({
              ...prev,
              totalStudents: mentorData.totalStudents || 0,
              rating: mentorData.rating || 0,
              totalSessions: mentorData.totalSessions || prev.totalSessions,
            }));
          }
        } catch (e) {
          // Silently handle
        }
      }
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statsCards = [
    { icon: 'people', label: 'Students', value: stats.totalStudents, color: '#3B82F6', bgColor: '#3B82F615' },
    { icon: 'calendar', label: 'Today', value: stats.todaySessions, color: '#10B981', bgColor: '#10B98115' },
    { icon: 'star', label: 'Rating', value: stats.rating.toFixed(1), color: '#F59E0B', bgColor: '#F59E0B15' },
    { icon: 'videocam', label: 'Sessions', value: stats.totalSessions, color: '#8B5CF6', bgColor: '#8B5CF615' },
  ];

  const quickActions = [
    { icon: 'create-outline', label: 'Write Blog', color: '#10B981', onPress: () => navigation.navigate('BlogTab', { screen: 'CreateBlog' }) },
    { icon: 'calendar-outline', label: 'Schedule', color: '#3B82F6', onPress: () => navigation.navigate('MentorSchedule') },
    { icon: 'chatbubbles-outline', label: 'Messages', color: '#8B5CF6', onPress: () => navigation.navigate('ChatTab') },
    { icon: 'globe-outline', label: 'Community', color: '#F59E0B', onPress: () => navigation.navigate('CommunityTab') },
  ];

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header */}
        <LinearGradient
          colors={['#059669', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.userAvatarText}>{getInitials(user?.name)}</Text>
                </View>
              )}
              <View style={styles.greetingWrap}>
                <Text style={styles.greeting}>Welcome back 🎓</Text>
                <Text style={styles.userName}>{user?.name || 'Mentor'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {statsCards.map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
                <View style={[styles.statIconWrap, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickAction}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickIconWrap, { backgroundColor: action.color + '15', borderColor: action.color + '30' }]}>
                    <Ionicons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upcoming Sessions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 Upcoming Sessions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MentorSchedule')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <View key={meeting._id} style={styles.meetingCard}>
                  <View style={styles.meetingLeft}>
                    <View style={styles.meetingDateBadge}>
                      <Text style={styles.meetingDateDay}>
                        {new Date(meeting.date).getDate()}
                      </Text>
                      <Text style={styles.meetingDateMonth}>
                        {new Date(meeting.date).toLocaleString('default', { month: 'short' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingSubject} numberOfLines={1}>{meeting.subject}</Text>
                    <Text style={styles.meetingStudent}>
                      👤 {meeting.userName || 'Student'}
                    </Text>
                    <Text style={styles.meetingTime}>
                      ⏰ {meeting.timeSlot?.startTime} - {meeting.timeSlot?.endTime}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: meeting.status === 'confirmed' ? colors.successLight : colors.warningLight
                  }]}>
                    <Text style={[styles.statusText, {
                      color: meeting.status === 'confirmed' ? colors.success : colors.warning
                    }]}>
                      {meeting.status}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="calendar-outline" size={36} color={colors.textLight} />
                <Text style={styles.emptyText}>No upcoming sessions</Text>
              </View>
            )}
          </View>

          {/* My Recent Blogs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✍️ My Blogs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BlogTab')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            {myBlogs.length > 0 ? (
              myBlogs.map((blog) => (
                <TouchableOpacity
                  key={blog._id}
                  style={styles.blogCard}
                  onPress={() => navigation.navigate('BlogTab', { screen: 'BlogDetail', params: { blogId: blog._id } })}
                >
                  <View style={styles.blogInfo}>
                    <Text style={styles.blogTitle} numberOfLines={2}>{blog.title}</Text>
                    <View style={styles.blogMeta}>
                      <Text style={styles.blogMetaText}>
                        👁 {blog.views || 0} views • ❤️ {blog.likes || 0} likes
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.blogStatus, {
                    backgroundColor: blog.isPublished ? colors.successLight : colors.warningLight
                  }]}>
                    <Text style={[styles.blogStatusText, {
                      color: blog.isPublished ? colors.success : colors.warning
                    }]}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={styles.emptySection}
                onPress={() => navigation.navigate('BlogTab', { screen: 'CreateBlog' })}
              >
                <Ionicons name="create-outline" size={36} color={colors.primary} />
                <Text style={styles.emptyText}>Write your first blog</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  greetingWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meetingLeft: {
    marginRight: 14,
  },
  meetingDateBadge: {
    backgroundColor: colors.primaryFaded,
    borderRadius: 10,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingDateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  meetingDateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  meetingInfo: {
    flex: 1,
  },
  meetingSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  meetingStudent: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  meetingTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  blogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blogInfo: {
    flex: 1,
    marginRight: 10,
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  blogMeta: {
    flexDirection: 'row',
  },
  blogMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  blogStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  blogStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 8,
  },
});

export default MentorDashboardScreen;
