import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { formatTimeAgo } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MyBlogsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, published, draft

  const fetchBlogs = useCallback(async () => {
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await api.get(`/blogs/my/list?limit=50${statusParam}`);
      setBlogs(response.data?.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchBlogs();
  }, [fetchBlogs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  const renderBlog = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('BlogDetail', { blogId: item._id })}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.blogThumbnail} />
      ) : (
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.blogThumbnailPlaceholder}
        >
          <Ionicons name="document-text" size={28} color="#fff" />
        </LinearGradient>
      )}

      <View style={styles.blogInfo}>
        <View style={styles.blogTop}>
          <View style={[styles.statusBadge, {
            backgroundColor: item.isPublished ? colors.successLight : colors.warningLight
          }]}>
            <Text style={[styles.statusText, {
              color: item.isPublished ? colors.success : colors.warning
            }]}>
              {item.isPublished ? '✅ Published' : '📝 Draft'}
            </Text>
          </View>
          <Text style={styles.blogCategory}>{item.category?.replace('-', ' ')}</Text>
        </View>

        <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>

        <View style={styles.blogStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={13} color={colors.textLight} />
            <Text style={styles.statText}>{item.views || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={13} color={colors.textLight} />
            <Text style={styles.statText}>{item.likes || 0}</Text>
          </View>
          <Text style={styles.blogTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Loading your blogs..." />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>✍️ My Blogs</Text>
            <Text style={styles.headerSubtitle}>{blogs.length} article{blogs.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateBlog')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filter */}
      <View style={styles.filterRow}>
        {['all', 'published', 'draft'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={blogs}
        keyExtractor={(item) => item._id}
        renderItem={renderBlog}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="create-outline"
            title="No blogs yet"
            message="Share your knowledge with students!"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBlog')}
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
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  blogCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blogThumbnail: {
    width: 100,
    height: 110,
  },
  blogThumbnailPlaceholder: {
    width: 100,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  blogTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  blogCategory: {
    fontSize: 10,
    color: colors.textLight,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  blogStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: 3,
  },
  blogTime: {
    fontSize: 10,
    color: colors.textLight,
    marginLeft: 'auto',
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

export default MyBlogsScreen;
