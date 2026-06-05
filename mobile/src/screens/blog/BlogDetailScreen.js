import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { formatDate, getCategoryLabel } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BlogDetailScreen = ({ route, navigation }) => {
  const { blogId } = route.params;
  const insets = useSafeAreaInsets();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const res = await api.get(`/blogs/${blogId}`);
      setBlog(res.data?.blog || null);
    } catch (e) {
      console.error('Error fetching blog:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    try {
      await api.post(`/blogs/${blogId}/like`);
      setBlog(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev);
    } catch (e) {
      setLiked(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${blog?.title}\n\nhttps://psindia.netlify.app/blog/${blog?.slug || blogId}`,
      });
    } catch (e) {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!blog) return <View style={styles.center}><Text>Article not found</Text></View>;

  // HTML Entities decoder
  const decodeHtmlEntities = (str) => {
    if (!str) return '';
    return str
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"');
  };

  // Inline styling parser (handles <strong> and <b>)
  const renderInlineText = (text, textStyle) => {
    if (!text) return null;
    const parts = text.split(/(<strong>.*?<\/strong>|<b>.*?<\/b>|<em>.*?<\/em>|<i>.*?<\/i>)/gi);
    return parts.map((part, index) => {
      if (part.startsWith('<strong>') || part.startsWith('<b>')) {
        const boldText = part.replace(/<\/?(strong|b)>/gi, '');
        return (
          <Text key={index} style={[textStyle, styles.boldText]}>
            {decodeHtmlEntities(boldText)}
          </Text>
        );
      }
      if (part.startsWith('<em>') || part.startsWith('<i>')) {
        const italicText = part.replace(/<\/?(em|i)>/gi, '');
        return (
          <Text key={index} style={[textStyle, styles.italicText]}>
            {decodeHtmlEntities(italicText)}
          </Text>
        );
      }
      return (
        <Text key={index} style={textStyle}>
          {decodeHtmlEntities(part)}
        </Text>
      );
    });
  };

  // Block level HTML parser
  const parseHtml = (html) => {
    if (!html) return [];
    
    let processed = html
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n');
    
    const regex = /<(h2|h3|p|li|blockquote)>([\s\S]*?)<\/\1>/gi;
    const blocks = [];
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(processed)) !== null) {
      const gap = processed.substring(lastIndex, match.index).trim();
      if (gap) {
        const cleanGap = gap.replace(/<[^>]*>/g, '').trim();
        if (cleanGap) {
          blocks.push({ tag: 'p', content: cleanGap });
        }
      }
      
      blocks.push({
        tag: match[1].toLowerCase(),
        content: match[2].trim()
      });
      lastIndex = regex.lastIndex;
    }
    
    const remaining = processed.substring(lastIndex).trim();
    if (remaining) {
      const cleanRemaining = remaining.replace(/<[^>]*>/g, '').trim();
      if (cleanRemaining) {
        blocks.push({ tag: 'p', content: cleanRemaining });
      }
    }
    
    if (blocks.length === 0) {
      return [{ tag: 'p', content: processed.replace(/<[^>]*>/g, '').trim() }];
    }
    
    return blocks;
  };

  // Estimate reading time
  const words = (blog.excerpt || blog.content || '').split(/\s+/).length;
  const minRead = Math.max(1, Math.ceil(words / 220));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          {blog.thumbnail ? (
            <Image source={{ uri: blog.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.heroImage} />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.heroOverlay} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, { top: insets.top + 8 }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Category & Date */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getCategoryLabel(blog.category)}</Text>
            </View>
            <Text style={styles.date}>{formatDate(blog.publishedAt || blog.createdAt)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{blog.title}</Text>

          {/* Author & Stats */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={14} color={colors.primary} />
            </View>
            <Text style={styles.authorName}>{blog.authorName || 'ParthSarthi'}</Text>
            <View style={styles.statsDot} />
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statsText}>{minRead} min read</Text>
            <View style={styles.statsDot} />
            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statsText}>{blog.views || 0}</Text>
          </View>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {blog.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Parsed Premium Content rendering */}
          <View style={styles.contentBlocks}>
            {parseHtml(blog.content).map((block, index) => {
              switch (block.tag) {
                case 'h2':
                  return (
                    <View key={index} style={styles.h2}>
                      <Text style={styles.h2Text}>{renderInlineText(block.content, styles.h2Text)}</Text>
                    </View>
                  );
                case 'h3':
                  return (
                    <View key={index} style={styles.h3}>
                      <Text style={styles.h3Text}>{renderInlineText(block.content, styles.h3Text)}</Text>
                    </View>
                  );
                case 'li':
                  return (
                    <View key={index} style={styles.bulletItem}>
                      <Text style={styles.bullet}>{'\u2022'}</Text>
                      <View style={styles.bulletContent}>
                        <Text style={styles.bulletText}>{renderInlineText(block.content, styles.bulletText)}</Text>
                      </View>
                    </View>
                  );
                case 'blockquote':
                  return (
                    <View key={index} style={styles.blockquote}>
                      <Text style={styles.blockquoteText}>{renderInlineText(block.content, styles.blockquoteText)}</Text>
                    </View>
                  );
                case 'p':
                default:
                  return (
                    <View key={index} style={styles.paragraph}>
                      <Text style={styles.paragraphText}>{renderInlineText(block.content, styles.paragraphText)}</Text>
                    </View>
                  );
              }
            })}
          </View>

          {/* Like & Share section */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, liked && styles.actionBtnActive]}
              onPress={handleLike}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={22}
                color={liked ? colors.error : colors.textSecondary}
              />
              <Text style={[styles.actionText, liked && { color: colors.error }]}>
                {liked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroWrap: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 260,
    backgroundColor: colors.inputBg,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textWhite,
    lineHeight: 32,
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite,
  },
  statsDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textLight,
  },
  statsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contentBlocks: {
    marginBottom: 24,
  },
  h2: {
    marginTop: 24,
    marginBottom: 10,
  },
  h2Text: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textWhite,
    lineHeight: 27,
  },
  h3: {
    marginTop: 18,
    marginBottom: 8,
  },
  h3Text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 6,
    marginBottom: 14,
  },
  paragraphText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 25,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textWhite,
  },
  italicText: {
    fontStyle: 'italic',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  bullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 10,
    lineHeight: 23,
  },
  bulletContent: {
    flex: 1,
  },
  bulletText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 23,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 16,
    marginVertical: 18,
    backgroundColor: colors.inputBg,
    paddingVertical: 12,
    borderRadius: 8,
  },
  blockquoteText: {
    fontSize: 15,
    color: colors.textWhite,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
  },
  actionBtnActive: {
    backgroundColor: colors.errorLight,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default BlogDetailScreen;
