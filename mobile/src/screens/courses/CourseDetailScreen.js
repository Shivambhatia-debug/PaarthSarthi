import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api/axios';
import colors from '../../constants/colors';
import { formatPrice, getCategoryLabel } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setCourse(res.data?.course || null);
    } catch (e) {
      console.error('Error fetching course:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <View style={styles.center}><Text>Course not found</Text></View>;

  const displayPrice = course.isFree ? 'Free' : formatPrice(course.discountPrice || course.price);
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroWrap}>
          {course.thumbnail ? (
            <Image source={{ uri: course.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.heroImage} />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.heroOverlayTop} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Category & Level */}
          <View style={styles.tagsRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getCategoryLabel(course.category)}</Text>
            </View>
            {course.level && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.infoLight }]}>
                <Text style={[styles.categoryText, { color: colors.info }]}>{course.level}</Text>
              </View>
            )}
            {course.language && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.categoryText, { color: colors.success }]}>{course.language}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{course.title}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color={colors.star} />
              <Text style={styles.statValue}>{course.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>({course.totalReviews || 0})</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statValue}>{course.enrolledStudents || 0}</Text>
              <Text style={styles.statLabel}>students</Text>
            </View>
            {course.totalDuration && (
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.statValue}>{course.totalDuration}</Text>
              </View>
            )}
          </View>

          {/* Instructor */}
          {course.instructorName && (
            <View style={styles.instructorRow}>
              <View style={styles.instructorAvatar}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.instructorLabel}>Instructor</Text>
                <Text style={styles.instructorName}>{course.instructorName}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* Features */}
          {course.features && course.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
              {course.features.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {course.requirements.map((req, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="ellipse" size={8} color={colors.textSecondary} />
                  <Text style={styles.featureText}>{req}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Modules */}
          {course.modules && course.modules.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Content</Text>
              <Text style={styles.moduleCount}>
                {course.modules.length} modules • {course.totalLessons || 0} lessons
              </Text>
              {course.modules.map((mod, i) => (
                <View key={i} style={styles.moduleCard}>
                  <TouchableOpacity
                    style={styles.moduleHeader}
                    onPress={() => setExpandedModule(expandedModule === i ? null : i)}
                  >
                    <View style={styles.moduleHeaderLeft}>
                      <View style={styles.moduleNumber}>
                        <Text style={styles.moduleNumberText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.moduleTitle}>{mod.title}</Text>
                        {mod.duration && <Text style={styles.moduleDuration}>{mod.duration}</Text>}
                      </View>
                    </View>
                    <Ionicons
                      name={expandedModule === i ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {expandedModule === i && mod.lessons && (
                    <View style={styles.lessons}>
                      {mod.lessons.map((lesson, j) => (
                        <View key={j} style={styles.lessonRow}>
                          <Ionicons
                            name={lesson.type === 'video' ? 'play-circle-outline' : lesson.type === 'quiz' ? 'help-circle-outline' : 'document-text-outline'}
                            size={18}
                            color={colors.primary}
                          />
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          {lesson.duration && <Text style={styles.lessonDuration}>{lesson.duration}</Text>}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price</Text>
          <View style={styles.priceRow}>
            <Text style={styles.mainPrice}>{displayPrice}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>{formatPrice(course.price)}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enrollBtn}
          >
            <Text style={styles.enrollBtnText}>Enroll Now</Text>
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
    height: 240,
    backgroundColor: colors.inputBg,
  },
  heroOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
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
  content: {
    padding: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.primaryFaded,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 1,
  },
  instructorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  instructorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
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
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  moduleCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  moduleCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  moduleDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lessons: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  lessonDuration: {
    fontSize: 12,
    color: colors.textLight,
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
  priceSection: {},
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 15,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  enrollBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  enrollBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CourseDetailScreen;
