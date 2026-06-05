import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { formatPrice, truncateText } from '../utils/helpers';

const CourseCard = ({ course, onPress, horizontal = false }) => {
  const {
    title,
    shortDescription,
    description,
    thumbnail,
    category,
    price,
    discountPrice,
    isFree,
    rating,
    totalReviews,
    enrolledStudents,
    level,
    instructorName,
  } = course;

  const displayPrice = isFree ? 'Free' : formatPrice(discountPrice || price);
  const originalPrice = discountPrice ? formatPrice(price) : null;
  const desc = shortDescription || description;

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.85}>
        <Image
          source={thumbnail ? { uri: thumbnail } : require('../../assets/icon.png')}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        <View style={styles.horizontalContent}>
          <Text style={styles.category}>{category?.replace(/-/g, ' ').toUpperCase()}</Text>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.ratingText}>{rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.reviewsText}>({totalReviews || 0})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{displayPrice}</Text>
            {originalPrice && <Text style={styles.originalPrice}>{originalPrice}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={thumbnail ? { uri: thumbnail } : require('../../assets/icon.png')}
        style={styles.image}
        resizeMode="cover"
      />
      {isFree && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeText}>FREE</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.category}>{category?.replace(/-/g, ' ').toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{truncateText(desc, 80)}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.ratingText}>{rating?.toFixed(1) || '0.0'}</Text>
          </View>
          <View style={styles.enrollRow}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.enrollText}>{enrolledStudents || 0}</Text>
          </View>
          {level && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {instructorName && (
            <Text style={styles.instructor} numberOfLines={1}>
              <Ionicons name="person-outline" size={12} color={colors.textSecondary} /> {instructorName}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{displayPrice}</Text>
            {originalPrice && <Text style={styles.originalPrice}>{originalPrice}</Text>}
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.inputBg,
  },
  freeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  enrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enrollText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  levelBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructor: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  // Horizontal card styles
  horizontalCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    width: 260,
    marginRight: 14,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  horizontalImage: {
    width: '100%',
    height: 130,
    backgroundColor: colors.inputBg,
  },
  horizontalContent: {
    padding: 12,
  },
});

export default CourseCard;
