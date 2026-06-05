import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { getInitials, formatPrice, cleanTags } from '../../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MentorDetailScreen = ({ route, navigation }) => {
  const { mentor } = route.params;
  const insets = useSafeAreaInsets();

  const cleanSpecs = cleanTags(mentor.specialization);
  const cleanSubs = cleanTags(mentor.subjects);

  const openLink = (url) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[styles.hero, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            {mentor.photo ? (
              <Image source={{ uri: mentor.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{getInitials(mentor.name)}</Text>
              </View>
            )}
            <Text style={styles.name}>{mentor.name}</Text>
            <Text style={styles.designation}>
              {mentor.designation}{mentor.company ? ` at ${mentor.company}` : ''}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mentor.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mentor.experience || 0}+</Text>
                <Text style={styles.statLabel}>Yrs Exp</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mentor.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mentor.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Bio */}
          {mentor.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{mentor.bio}</Text>
            </View>
          )}

          {/* Specialization */}
          {cleanSpecs && cleanSpecs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specialization</Text>
              <View style={styles.tagsWrap}>
                {cleanSpecs.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Subjects */}
          {cleanSubs && cleanSubs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subjects</Text>
              <View style={styles.tagsWrap}>
                {cleanSubs.map((sub, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: colors.infoLight }]}>
                    <Text style={[styles.tagText, { color: colors.info }]}>{sub}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Qualifications */}
          {mentor.qualifications && mentor.qualifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qualifications</Text>
              {mentor.qualifications.map((q, i) => (
                <View key={i} style={styles.listItem}>
                  <Ionicons name="school-outline" size={16} color={colors.primary} />
                  <Text style={styles.listItemText}>{q}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Certifications */}
          {mentor.certifications && mentor.certifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {mentor.certifications.map((c, i) => (
                <View key={i} style={styles.listItem}>
                  <Ionicons name="ribbon-outline" size={16} color={colors.secondary} />
                  <Text style={styles.listItemText}>{c}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Session Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>
                  {mentor.sessionPrice ? `₹${mentor.sessionPrice}/session` : 'Free'}
                </Text>
              </View>
              {mentor.sessionTypes && mentor.sessionTypes.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="videocam-outline" size={18} color={colors.primary} />
                  <Text style={styles.infoLabel}>Types</Text>
                  <Text style={styles.infoValue}>{mentor.sessionTypes.join(', ')}</Text>
                </View>
              )}
              {mentor.languages && mentor.languages.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="language-outline" size={18} color={colors.primary} />
                  <Text style={styles.infoLabel}>Languages</Text>
                  <Text style={styles.infoValue}>{mentor.languages.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Available Slots */}
          {mentor.availableSlots && mentor.availableSlots.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              {mentor.availableSlots.map((slot, i) => (
                <View key={i} style={styles.slotRow}>
                  <Text style={styles.slotDay}>{slot.day?.charAt(0).toUpperCase() + slot.day?.slice(1)}</Text>
                  <Text style={styles.slotTime}>{slot.startTime} - {slot.endTime}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Social Links */}
          {(mentor.linkedIn || mentor.twitter || mentor.website) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connect</Text>
              <View style={styles.socialsRow}>
                {mentor.linkedIn && (
                  <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(mentor.linkedIn)}>
                    <Ionicons name="logo-linkedin" size={22} color="#0077B5" />
                  </TouchableOpacity>
                )}
                {mentor.twitter && (
                  <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(mentor.twitter)}>
                    <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
                  </TouchableOpacity>
                )}
                {mentor.website && (
                  <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(mentor.website)}>
                    <Ionicons name="globe-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.priceLabel}>Session Price</Text>
          <Text style={styles.priceValue}>
            {mentor.sessionPrice ? `₹${mentor.sessionPrice}` : 'Free'}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('BookMeeting', { mentor })}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookBtn}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.bookBtnText}>Book Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 16,
  },
  heroContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  designation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  listItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  slotDay: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    elevation: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default MentorDetailScreen;
