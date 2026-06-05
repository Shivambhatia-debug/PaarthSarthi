import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import GradientHeader from '../../components/GradientHeader';

const CoursesScreen = () => {
  return (
    <View style={styles.container}>
      <GradientHeader title="Courses" subtitle="Premium career courses" />
      <View style={styles.content}>
        <View style={styles.comingSoonCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="book-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Coming Soon! 📚</Text>
          <Text style={styles.subtitle}>
            We are curating high-impact, professional courses from top industry mentors to help you master new skills. Stay tuned!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  comingSoonCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CoursesScreen;
