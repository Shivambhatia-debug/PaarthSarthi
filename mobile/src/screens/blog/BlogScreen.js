import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import api from '../../api/axios';
import colors from '../../constants/colors';
import BlogCard from '../../components/BlogCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import GradientHeader from '../../components/GradientHeader';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'career-tips', label: 'Career Tips' },
  { key: 'exam-preparation', label: 'Exam Prep' },
  { key: 'skill-development', label: 'Skills' },
  { key: 'success-stories', label: 'Success' },
  { key: 'industry-insights', label: 'Industry' },
  { key: 'mentorship', label: 'Mentorship' },
  { key: 'technology', label: 'Tech' },
];

const BlogScreen = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('all');

  const fetchBlogs = useCallback(async () => {
    try {
      let url = '/blogs?isPublished=true&limit=100';
      if (category !== 'all') url += `&category=${category}`;
      const res = await api.get(url);
      setBlogs(res.data?.blogs || []);
    } catch (e) {
      console.error('Error fetching blogs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Blog" subtitle="Insights & career articles" />

      {/* Category tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, category === item.key && styles.filterChipActive]}
              onPress={() => setCategory(item.key)}
            >
              <Text style={[styles.filterText, category === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={blogs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <BlogCard
              blog={item}
              onPress={() => navigation.navigate('BlogDetail', { blogId: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="newspaper-outline"
              title="No Articles Found"
              message="Check back later for new content"
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
  filterContainer: {
    paddingVertical: 12,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
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
  list: {
    padding: 20,
    paddingTop: 4,
  },
});

export default BlogScreen;
