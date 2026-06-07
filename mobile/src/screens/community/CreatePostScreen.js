import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

const CATEGORIES = [
  { key: 'discussion', label: '💬 Discussion', color: '#3B82F6' },
  { key: 'question', label: '❓ Question', color: '#8B5CF6' },
  { key: 'success-story', label: '🏆 Success Story', color: '#F59E0B' },
  { key: 'resource', label: '📚 Resource', color: '#10B981' },
  { key: 'general', label: '📝 General', color: colors.textSecondary },
];

const CreatePostScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('discussion');
  const [tagsText, setTagsText] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    setPosting(true);
    try {
      const tags = tagsText.split(',').map(t => t.trim()).filter(t => t);

      await api.post('/community/posts', {
        content: content.trim(),
        category,
        tags,
      });

      Alert.alert('Success! 🎉', 'Your post has been published', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.postBtn, content.trim() ? styles.postBtnActive : styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={!content.trim() || posting}
        >
          <Text style={[styles.postBtnText, content.trim() && styles.postBtnTextActive]}>
            {posting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Author Preview */}
        <View style={styles.authorPreview}>
          <LinearGradient
            colors={user?.role === 'mentor' ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
            style={styles.authorAvatar}
          >
            <Text style={styles.authorAvatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </LinearGradient>
          <View>
            <Text style={styles.authorName}>{user?.name || 'User'}</Text>
            <Text style={styles.authorRole}>
              Posting as {user?.role === 'mentor' ? '🎓 Mentor' : '👨‍🎓 Student'}
            </Text>
          </View>
        </View>

        {/* Category Selector */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                category === cat.key && { backgroundColor: cat.color, borderColor: cat.color }
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[
                styles.categoryChipText,
                category === cat.key && { color: '#fff' }
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Input */}
        <Text style={styles.label}>What's on your mind?</Text>
        <View style={styles.contentInputContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="Share your thoughts, ask a question, or celebrate a win... ✨"
            placeholderTextColor={colors.textLight}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={5000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/5000</Text>
        </View>

        {/* Tags */}
        <Text style={styles.label}>Tags (optional)</Text>
        <TextInput
          style={styles.tagsInput}
          placeholder="career, engineering, tips (comma separated)"
          placeholderTextColor={colors.textLight}
          value={tagsText}
          onChangeText={setTagsText}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
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
  postBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postBtnActive: {
    backgroundColor: colors.primary,
  },
  postBtnDisabled: {
    backgroundColor: colors.cardElevated,
  },
  postBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
  postBtnTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  authorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  authorRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  contentInputContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
    minHeight: 160,
  },
  contentInput: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    minHeight: 120,
  },
  charCount: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  tagsInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 14,
  },
});

export default CreatePostScreen;
