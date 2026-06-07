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
import api from '../../api/axios';
import colors from '../../constants/colors';

const BLOG_CATEGORIES = [
  { key: 'career-tips', label: '💼 Career Tips' },
  { key: 'exam-preparation', label: '📖 Exam Prep' },
  { key: 'skill-development', label: '🛠 Skills' },
  { key: 'success-stories', label: '🏆 Success' },
  { key: 'industry-insights', label: '🏢 Industry' },
  { key: 'mentorship', label: '🎓 Mentorship' },
  { key: 'technology', label: '💻 Tech' },
  { key: 'wellness', label: '🧘 Wellness' },
  { key: 'startup', label: '🚀 Startup' },
  { key: 'other', label: '📝 Other' },
];

const CreateBlogScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('career-tips');
  const [tagsText, setTagsText] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (publish = true) => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a blog title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please write blog content');
      return;
    }

    publish ? setPublishing(true) : setSaving(true);

    try {
      const tags = tagsText.split(',').map(t => t.trim()).filter(t => t);

      await api.post('/blogs', {
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        excerpt: excerpt.trim() || content.trim().substring(0, 200),
        isPublished: publish,
      });

      Alert.alert(
        publish ? 'Published! 🎉' : 'Saved as Draft 📝',
        publish ? 'Your blog is now live!' : 'You can publish it later.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create blog');
    } finally {
      setPublishing(false);
      setSaving(false);
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
        <Text style={styles.headerTitle}>Write Blog</Text>
        <TouchableOpacity
          style={[styles.publishBtn, title.trim() && content.trim() ? styles.publishBtnActive : styles.publishBtnDisabled]}
          onPress={() => handleSubmit(true)}
          disabled={!title.trim() || !content.trim() || publishing}
        >
          <Text style={[styles.publishBtnText, title.trim() && content.trim() && styles.publishBtnTextActive]}>
            {publishing ? '...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.formContent}>
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="Blog title..."
          placeholderTextColor={colors.textLight}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {BLOG_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.categoryChipText, category === cat.key && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Excerpt */}
        <Text style={styles.label}>Excerpt (short summary)</Text>
        <TextInput
          style={styles.excerptInput}
          placeholder="A brief summary of your blog..."
          placeholderTextColor={colors.textLight}
          value={excerpt}
          onChangeText={setExcerpt}
          maxLength={300}
          multiline
        />

        {/* Content */}
        <Text style={styles.label}>Content</Text>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your blog content here... ✍️"
            placeholderTextColor={colors.textLight}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length} characters</Text>
        </View>

        {/* Tags */}
        <Text style={styles.label}>Tags</Text>
        <TextInput
          style={styles.tagsInput}
          placeholder="career, engineering, tips (comma separated)"
          placeholderTextColor={colors.textLight}
          value={tagsText}
          onChangeText={setTagsText}
        />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.draftBtn}
            onPress={() => handleSubmit(false)}
            disabled={saving || !title.trim() || !content.trim()}
          >
            <Ionicons name="save-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.draftBtnText}>{saving ? 'Saving...' : 'Save Draft'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.publishLargeBtn, (!title.trim() || !content.trim()) && styles.publishLargeBtnDisabled]}
            onPress={() => handleSubmit(true)}
            disabled={publishing || !title.trim() || !content.trim()}
          >
            <Ionicons name="rocket-outline" size={18} color="#fff" />
            <Text style={styles.publishLargeBtnText}>
              {publishing ? 'Publishing...' : 'Publish Now'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
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
  publishBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
  },
  publishBtnActive: {
    backgroundColor: colors.primary,
  },
  publishBtnDisabled: {
    backgroundColor: colors.cardElevated,
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
  publishBtnTextActive: {
    color: '#fff',
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  excerptInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 24,
    minHeight: 70,
  },
  contentContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
    minHeight: 200,
  },
  contentInput: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    minHeight: 170,
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
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  draftBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  publishLargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginLeft: 12,
  },
  publishLargeBtnDisabled: {
    backgroundColor: colors.cardElevated,
  },
  publishLargeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
});

export default CreateBlogScreen;
