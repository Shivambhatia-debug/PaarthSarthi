import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import colors from '../../constants/colors';
import MentorCard from '../../components/MentorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import GradientHeader from '../../components/GradientHeader';

const MENTOR_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'Career Guidance', label: 'Career Guidance' },
  { key: 'Psychometric Analysis', label: 'Psychometric Test' },
  { key: 'College Selection', label: 'College Selection' },
];

const MentorsScreen = ({ navigation }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchMentors = useCallback(async () => {
    try {
      let url = '/mentors?isActive=true&limit=100';
      let activeSearch = search.trim();
      
      // If a category filter is active, merge it with search text
      if (category !== 'all') {
        activeSearch = activeSearch ? `${activeSearch} ${category}` : category;
      }
      
      if (activeSearch) {
        url += `&search=${encodeURIComponent(activeSearch)}`;
      }
      
      const res = await api.get(url);
      setMentors(res.data?.mentors || []);
    } catch (e) {
      console.error('Error fetching mentors:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentors();
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Mentors" subtitle="Connect with industry experts">
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mentors..."
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchMentors}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </GradientHeader>

      {/* Category selector chips */}
      <View style={styles.filterContainer}>
        <FlatList
          data={MENTOR_CATEGORIES}
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
          data={mentors}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <MentorCard
              mentor={item}
              onPress={() => navigation.navigate('MentorDetail', { mentor: item })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Mentors Found"
              message="Try different search terms or categories"
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    marginLeft: 8,
  },
  list: {
    padding: 20,
    paddingTop: 4,
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
});

export default MentorsScreen;
