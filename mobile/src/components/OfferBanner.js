import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40;

const cleanText = (txt) => {
  if (!txt) return '';
  return txt.replace(/\*\*|→|\*/g, '').trim();
};

const OfferBanner = ({ offers, onPress }) => {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!offers || offers.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % offers.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, offers]);

  if (!offers || offers.length === 0) return null;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress?.(item)}
      style={styles.bannerCard}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.bannerImage}
          />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.bannerTitle} numberOfLines={1}>{cleanText(item.title)}</Text>
        {item.subtitle && (
          <Text style={styles.bannerSubtitle} numberOfLines={2}>{cleanText(item.subtitle)}</Text>
        )}
        <View style={styles.ctaRow}>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaText}>{item.ctaText || 'Get admission now'}</Text>
            <Ionicons name="arrow-forward" size={12} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={offers}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        contentContainerStyle={styles.listContainer}
      />
      {offers.length > 1 && (
        <View style={styles.dots}>
          {offers.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inputBg,
  },
  textContainer: {
    padding: 14,
    backgroundColor: colors.card,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 16,
  },
});

export default OfferBanner;
