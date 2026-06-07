import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { getInitials, formatTimeAgo } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const PostDetailScreen = ({ navigation, route }) => {
  const { postId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPostAndComments = useCallback(async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/community/posts/${postId}`),
        api.get(`/community/posts/${postId}/comments?limit=50`)
      ]);
      setPost(postRes.data?.post);
      setComments(commentsRes.data?.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      setPost(prev => ({
        ...prev,
        likesCount: response.data.likesCount,
        isLiked: response.data.isLiked,
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, {
        content: commentText.trim()
      });
      setComments(prev => [response.data.comment, ...prev]);
      setCommentText('');
      setPost(prev => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        {item.author?.avatar ? (
          <Image source={{ uri: item.author.avatar }} style={styles.commentAvatar} />
        ) : (
          <View style={styles.commentAvatarPlaceholder}>
            <Text style={styles.commentAvatarText}>
              {getInitials(item.authorName || item.author?.name)}
            </Text>
          </View>
        )}
        <View style={styles.commentInfo}>
          <View style={styles.commentNameRow}>
            <Text style={styles.commentAuthor}>{item.authorName || item.author?.name}</Text>
            {item.authorRole === 'mentor' && (
              <View style={styles.miniRoleBadge}>
                <Text style={styles.miniRoleBadgeText}>Mentor</Text>
              </View>
            )}
          </View>
          <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>

      {/* Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply._id} style={styles.replyCard}>
              <Text style={styles.replyAuthor}>{reply.authorName || reply.author?.name}</Text>
              <Text style={styles.replyContent}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) return <LoadingSpinner message="Loading post..." />;

  if (!post) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.postSection}>
            {/* Author */}
            <View style={styles.authorRow}>
              {post.author?.avatar ? (
                <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
              ) : (
                <LinearGradient
                  colors={post.authorRole === 'mentor' ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
                  style={styles.authorAvatarPlaceholder}
                >
                  <Text style={styles.authorAvatarText}>
                    {getInitials(post.authorName || post.author?.name)}
                  </Text>
                </LinearGradient>
              )}
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.authorName}>{post.authorName || post.author?.name}</Text>
                  {post.authorRole === 'mentor' && (
                    <View style={styles.roleBadge}>
                      <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
                      <Text style={styles.roleBadgeText}>Mentor</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {post.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={post.isLiked ? '#EF4444' : colors.textSecondary}
                />
                <Text style={[styles.actionText, post.isLiked && { color: '#EF4444' }]}>
                  {post.likesCount || 0} likes
                </Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.actionText}>{post.commentsCount || 0} comments</Text>
              </View>
            </View>

            {/* Comments Header */}
            <Text style={styles.commentsTitle}>Comments</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noComments}>No comments yet. Be the first!</Text>
        }
      />

      {/* Comment Input */}
      <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textLight}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, commentText.trim() && styles.sendBtnActive]}
          onPress={handleComment}
          disabled={!commentText.trim() || submitting}
        >
          <Ionicons name="send" size={18} color={commentText.trim() ? '#fff' : colors.textLight} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingVertical: 12,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postSection: {
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  authorAvatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
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
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 23,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  tag: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  commentsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 20,
  },
  noComments: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 30,
  },
  commentCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  commentInfo: {
    flex: 1,
  },
  commentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  miniRoleBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  miniRoleBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.primary,
  },
  commentTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  commentContent: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  repliesContainer: {
    marginTop: 10,
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: 12,
  },
  replyCard: {
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  replyContent: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default PostDetailScreen;
