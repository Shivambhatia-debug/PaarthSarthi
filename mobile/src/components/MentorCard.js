import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import config from '../constants/config';
import { getInitials, cleanTags } from '../utils/helpers';

const MentorCard = ({ mentor, onPress, compact = false }) => {
  const {
    name,
    photo,
    designation,
    company,
    specialization,
    experience,
    rating,
    totalSessions,
    sessionPrice,
    isFeatured,
  } = mentor;

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${config.API_BASE_URL}${url}`;
  };

  const cleanSpecs = cleanTags(specialization);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.85}>
        {photo ? (
          <Image source={{ uri: getImageUrl(photo) }} style={styles.compactAvatar} />
        ) : (
          <View style={[styles.compactAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        )}
        <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
        <Text style={styles.compactDesignation} numberOfLines={1}>{designation}</Text>
        <View style={styles.compactRating}>
          <Ionicons name="star" size={12} color={colors.star} />
          <Text style={styles.compactRatingText}>{rating?.toFixed(1) || '0.0'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {isFeatured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="ribbon" size={12} color="#fff" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      <View style={styles.row}>
        {photo ? (
          <Image source={{ uri: getImageUrl(photo) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarTextLarge}>{getInitials(name)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.designation} numberOfLines={1}>
            {designation}{company ? ` at ${company}` : ''}
          </Text>

          {cleanSpecs && cleanSpecs.length > 0 && (
            <View style={styles.tags}>
              {cleanSpecs.slice(0, 3).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="star" size={14} color={colors.star} />
              <Text style={styles.statText}>{rating?.toFixed(1) || '0.0'}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{experience || 0}+ yrs</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="videocam-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{totalSessions || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>
          {'Free consultation'}
        </Text>
        <View style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.inputBg,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarTextLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  designation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  // Compact card styles
  compactCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    width: 140,
    marginRight: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: colors.inputBg,
  },
  compactName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  compactDesignation: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default MentorCard;
