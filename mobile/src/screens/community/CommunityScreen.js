import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { getInitials, formatTimeAgo, resolveImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const CATEGORIES = [
  { key: 'all', label: '🔥 All', color: colors.primary },
  { key: 'discussion', label: '💬 Discussion', color: '#3B82F6' },
  { key: 'question', label: '❓ Q&A', color: '#8B5CF6' },
  { key: 'success-story', label: '🏆 Success', color: '#F59E0B' },
  { key: 'resource', label: '📚 Resources', color: '#10B981' },
  { key: 'announcement', label: '📢 News', color: '#EF4444' },
];

const CommunityScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1, category = selectedCategory) => {
    try {
      const categoryParam = category !== 'all' ? `&category=${category}` : '';
      const response = await api.get(`/community/posts?page=${pageNum}&limit=15${categoryParam}`);
      const newPosts = response.data?.posts || [];

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 15);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(1, selectedCategory);
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, selectedCategory);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, selectedCategory);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likesCount: response.data.likesCount,
            isLiked: response.data.isLiked,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getCategoryStyle = (category) => {
    const cat = CATEGORIES.find(c => c.key === category);
    return cat ? { backgroundColor: cat.color + '15', borderColor: cat.color + '30' } : {};
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find(c => c.key === category);
    return cat?.color || colors.textSecondary;
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
    >
      {/* Author Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorRow}>
          {item.author?.avatar || item.authorAvatar ? (
            <Image
              source={{ uri: resolveImageUrl(item.author?.avatar || item.authorAvatar) }}
              style={styles.authorAvatar}
            />
          ) : (
            <LinearGradient
              colors={item.authorRole === 'mentor' ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
              style={styles.authorAvatarPlaceholder}
            >
              <Text style={styles.authorAvatarText}>
                {getInitials(item.authorName || item.author?.name)}
              </Text>
            </LinearGradient>
          )}
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{item.authorName || item.author?.name}</Text>
              {item.authorRole === 'mentor' && (
                <View style={styles.roleBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
                  <Text style={styles.roleBadgeText}>Mentor</Text>
                </View>
              )}
            </View>
            <Text style={styles.postTime}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.categoryChip, getCategoryStyle(item.category)]}>
          <Text style={[styles.categoryChipText, { color: getCategoryColor(item.category) }]}>
            {item.category?.replace('-', ' ')}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postContent} numberOfLines={4}>
        {item.content}
      </Text>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleLike(item._id)}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={item.isLiked ? '#EF4444' : colors.textSecondary}
          />
          <Text style={[styles.actionText, item.isLiked && { color: '#EF4444' }]}>
            {item.likesCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('PostDetail', { postId: item._id })}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && posts.length === 0) return <LoadingSpinner message="Loading community..." />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>🌐 Community</Text>
            <Text style={styles.headerSubtitle}>Share, learn & grow together</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryFilter,
              selectedCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color }
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[
              styles.categoryFilterText,
              selectedCategory === cat.key && { color: '#fff' }
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="globe-outline"
            title="No posts yet"
            message="Be the first to share something with the community!"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="create-outline" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
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
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoriesContainer: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  categoryFilter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 2,
  },
  postTime: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityScreen;
