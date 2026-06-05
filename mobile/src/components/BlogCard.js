import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { formatDate, truncateText, getRelativeTime } from '../utils/helpers';

const BlogCard = ({ blog, onPress, compact = false }) => {
  const {
    title,
    excerpt,
    content,
    thumbnail,
    category,
    authorName,
    views,
    likes,
    createdAt,
  } = blog;

  const desc = excerpt || content;

  // Calculate reading time
  const words = (excerpt || content || '').split(/\s+/).length;
  const minRead = Math.max(1, Math.ceil(words / 220));

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.85}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.compactImage} resizeMode="cover" />
        ) : (
          <View style={[styles.compactImage, { backgroundColor: colors.primaryFaded, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.compactContent}>
          <View style={styles.compactCategoryRow}>
            <Text style={styles.compactCategory}>{category?.replace(/-/g, ' ').toUpperCase()}</Text>
            <Text style={styles.compactTime}>{minRead} min read</Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.compactDate}>{getRelativeTime(createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: colors.primaryFaded, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="document-text-outline" size={40} color={colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category?.replace(/-/g, ' ')}</Text>
          </View>
          <Text style={styles.date}>{formatDate(createdAt)} • {minRead} min read</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>{truncateText(desc, 120)}</Text>
        <View style={styles.footer}>
          <Text style={styles.author}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} /> {authorName || 'ParthSarthi'}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{views || 0}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{likes || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.inputBg,
  },
  content: {
    padding: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 8,
    lineHeight: 23,
  },
  excerpt: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  author: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Compact card styles
  compactCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactImage: {
    width: 95,
    height: 95,
    backgroundColor: colors.inputBg,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  compactCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  compactTime: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite,
    lineHeight: 19,
    marginBottom: 6,
  },
  compactDate: {
    fontSize: 11,
    color: colors.textLight,
  },
});

export default BlogCard;
