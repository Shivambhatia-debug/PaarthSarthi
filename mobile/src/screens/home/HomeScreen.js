import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { getInitials, resolveImageUrl, getRelativeTime } from '../../utils/helpers';
import CourseCard from '../../components/CourseCard';
import MentorCard from '../../components/MentorCard';
import BlogCard from '../../components/BlogCard';
import OfferBanner from '../../components/OfferBanner';
import LoadingSpinner from '../../components/LoadingSpinner';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageError, setImageError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [offersRes, mentorsRes, coursesRes, blogsRes, notifRes, postsRes] = await Promise.allSettled([
        api.get('/offers'),
        api.get('/mentors/featured'),
        api.get('/courses?limit=6&isPublished=true'),
        api.get('/blogs?limit=5&isPublished=true'),
        api.get('/notifications/unread-count'),
        api.get('/community/posts?limit=3'),
      ]);

      if (offersRes.status === 'fulfilled') setOffers(offersRes.value.data?.offers || []);
      if (mentorsRes.status === 'fulfilled') setFeaturedMentors(mentorsRes.value.data?.mentors || []);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data?.courses || []);
      if (blogsRes.status === 'fulfilled') setBlogs(blogsRes.value.data?.blogs || []);
      if (notifRes.status === 'fulfilled') setUnreadCount(notifRes.value.data?.unreadCount || 0);
      if (postsRes.status === 'fulfilled') setCommunityPosts(postsRes.value.data?.posts || []);
    } catch (e) {
      console.error('Error fetching home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  const quickActions = [
    { icon: 'calendar-outline', label: 'Book Session', color: colors.primary, screen: 'MentorsTab' },
    { icon: 'book-outline', label: 'Courses', color: colors.success, screen: 'CoursesList' },
    { icon: 'newspaper-outline', label: 'Blogs', color: colors.info, screen: 'BlogsList' },
    { icon: 'school-outline', label: 'Admission', color: colors.secondary, screen: 'Admission' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeftRow}>
              {user?.avatar && !imageError ? (
                <Image 
                  source={{ uri: resolveImageUrl(user.avatar) }} 
                  style={styles.userAvatar} 
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.userAvatarText}>{getInitials(user?.name)}</Text>
                </View>
              )}
              <View style={styles.greetingTextWrap}>
                <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Student'} 👋</Text>
                <Text style={styles.subGreeting}>Let's build your career today</Text>
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

        {/* Offers Banner */}
        {offers.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <OfferBanner
              offers={offers}
              onPress={(offer) => {
                if (offer.ctaLink === '/admission' || offer.ctaLink === 'Admission') {
                  navigation.navigate('Admission');
                } else if (offer.ctaLink) {
                  if (offer.ctaLink.startsWith('http://') || offer.ctaLink.startsWith('https://')) {
                    Linking.openURL(offer.ctaLink).catch((err) =>
                      console.error('An error occurred opening URL:', err)
                    );
                  } else {
                    navigation.navigate(offer.ctaLink);
                  }
                }
              }}
            />
          </View>
        )}

        <View style={[styles.content, { marginTop: offers.length > 0 ? 0 : 20 }]}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {quickActions.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickAction}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.quickIconWrap,
                  {
                    backgroundColor: action.color + '10',
                    borderWidth: 1.2,
                    borderColor: action.color + '25',
                  }
                ]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Featured Mentors */}
          {featuredMentors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.titleWithIndicator}>
                  <View style={styles.headingIndicator} />
                  <Text style={styles.sectionTitle}>Featured Mentors</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('MentorsTab')}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={featuredMentors}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => (
                  <MentorCard
                    mentor={item}
                    compact
                    onPress={() => navigation.navigate('MentorsTab', { screen: 'MentorDetail', params: { mentor: item } })}
                  />
                )}
              />
            </View>
          )}

          {/* Community Feed */}
          {communityPosts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.titleWithIndicator}>
                  <View style={styles.headingIndicator} />
                  <Text style={styles.sectionTitle}>Community Discussions</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('CommunityTab')}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              {communityPosts.map((post) => (
                <TouchableOpacity
                  key={post._id}
                  style={styles.postCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('CommunityTab', { screen: 'PostDetail', params: { postId: post._id } })}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.authorRow}>
                      {post.author?.avatar || post.authorAvatar ? (
                        <Image source={{ uri: resolveImageUrl(post.author?.avatar || post.authorAvatar) }} style={styles.authorAvatar} />
                      ) : (
                        <View style={styles.authorAvatarPlaceholder}>
                          <Text style={styles.authorAvatarText}>{getInitials(post.authorName || post.author?.name)}</Text>
                        </View>
                      )}
                      <View style={styles.authorInfo}>
                        <Text style={styles.authorName}>{post.authorName || post.author?.name}</Text>
                        <Text style={styles.postTime}>{getRelativeTime(post.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{post.category?.replace('-', ' ')}</Text>
                    </View>
                  </View>
                  <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
                  <View style={styles.postFooter}>
                    <View style={styles.postStat}>
                      <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.postStatText}>{post.likesCount || 0}</Text>
                    </View>
                    <View style={styles.postStat}>
                      <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.postStatText}>{post.commentsCount || 0}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Latest Blogs */}
          {blogs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.titleWithIndicator}>
                  <View style={styles.headingIndicator} />
                  <Text style={styles.sectionTitle}>Latest Articles</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('BlogsList')}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              {blogs.slice(0, 3).map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  compact
                  onPress={() => navigation.navigate('BlogDetail', { blogId: blog._id })}
                />
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
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
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  greetingTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.badge,
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
    marginTop: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
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
  titleWithIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingIndicator: {
    width: 4,
    height: 17,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 8,
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
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  authorInfo: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  postTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.primaryFaded,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  postContent: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default HomeScreen;
