import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ──────────────────────────────────────
// QUESTIONNAIRE DATA
// ──────────────────────────────────────
const CLASSES = [
  { id: 'class_9', label: 'Class 9th', sub: 'Foundation & School Exams', emoji: '🎒', bg: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
  { id: 'class_10', label: 'Class 10th', sub: 'Board Exam Preparation', emoji: '🏫', bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
  { id: 'class_11', label: 'Class 11th', sub: 'JEE/NEET Target Start', emoji: '📚', bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  { id: 'class_12', label: 'Class 12th', sub: 'Boards + Entrance Exams', emoji: '🎓', bg: '#FDF2F8', border: '#FBCFE8', text: '#DB2777' },
  { id: 'dropper', label: 'Dropper / Repeater', sub: 'Dedicated Target Prep', emoji: '🎯', bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
];

const GOALS = [
  { id: 'jee', label: 'IIT-JEE Prep', sub: 'Engineering Entrance Target', emoji: '🚀', bg: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
  { id: 'neet', label: 'NEET-UG Prep', sub: 'Medical Entrance Target', emoji: '🩺', bg: '#FDF2F8', border: '#FBCFE8', text: '#DB2777' },
  { id: 'boards', label: 'Board Exams', sub: 'Aiming for 95%+ in Boards', emoji: '🏆', bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
  { id: 'coding', label: 'Coding & Tech', sub: 'Web Dev, Python, Internships', emoji: '💻', bg: '#F3F4F6', border: '#E5E7EB', text: '#374151' },
  { id: 'counseling', label: 'Career Counseling', sub: 'Confused about stream or goals', emoji: '🧭', bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
];

const STUDY_MODES = [
  { id: 'online', label: 'Online Live Classes', sub: 'Learn from top mentors at home', emoji: '💻', icon: 'desktop-outline', bg: 'rgba(59, 130, 246, 0.08)', border: '#3B82F6', text: '#3B82F6' },
  { id: 'offline', label: 'Offline Center / Hybrid', sub: 'Face-to-face coaching & support', emoji: '🏫', icon: 'school-outline', bg: 'rgba(16, 185, 129, 0.08)', border: '#10B981', text: '#10B981' },
  { id: 'mentorship', label: '1-on-1 Personal Mentorship', sub: 'Daily guidance by IIT/NEET rankers', emoji: '🧠', icon: 'people-outline', bg: 'rgba(139, 92, 246, 0.08)', border: '#8B5CF6', text: '#8B5CF6' },
];

const CHALLENGES = [
  { id: 'doubts', label: 'Clearing Complex Doubts', sub: 'Need fast answers to hard problems', emoji: '❓', bg: '#F3F4F6', border: '#E5E7EB', text: '#374151' },
  { id: 'schedule', label: 'Structured Time-table', sub: 'Struggling with consistency & schedule', emoji: '📅', bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  { id: 'guidance', label: 'Personal Guidance & Support', sub: 'No mentor to guide stream/career', emoji: '🤝', bg: '#EEF2FF', border: '#C7D2FE', text: '#4F46E5' },
  { id: 'scores', label: 'Improving Test Marks', sub: 'Need tricks to score higher in exams', emoji: '📈', bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' },
];

const AdmissionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0); // 0: Class, 1: Goal, 2: Mode, 3: Challenge, 4: Review/Verify
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Update progress bar
  useEffect(() => {
    const toValue = (step) / 4; // 0 to 1
    Animated.timing(progressAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const goTo = (nextStep) => {
    const dir = nextStep > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * -30, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(dir * 30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleBack = () => {
    if (step === 0) {
      navigation.goBack();
    } else {
      goTo(step - 1);
    }
  };

  const handleSelectOption = (value, setter, nextStep) => {
    setter(value);
    // Tiny delay for a premium feeling, letting the user see the selection highlight before transitioning
    setTimeout(() => {
      goTo(nextStep);
    }, 250);
  };

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit number';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const clsName = CLASSES.find(c => c.id === selectedClass)?.label || '';
      const goalName = GOALS.find(g => g.id === selectedGoal)?.label || '';
      const modeName = STUDY_MODES.find(m => m.id === selectedMode)?.label || '';
      const challengeName = CHALLENGES.find(ch => ch.id === selectedChallenge)?.label || '';

      await api.post('/admissions', {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email,
        currentClass: clsName,
        course: goalName || 'General Discovery',
        coachingInstitute: 'ParthSarthi Knowledge Hub',
        mode: selectedMode === 'online' ? 'online' : selectedMode === 'offline' ? 'offline' : 'both',
        stream: selectedGoal === 'jee' ? 'Science (PCM)' : selectedGoal === 'neet' ? 'Science (PCB)' : 'General',
        additionalNotes: `Student Discovery Profile. Class: ${clsName}, Target Goal: ${goalName}, Preferred Mode: ${modeName}, Main Challenge: ${challengeName}`,
      });
      setSubmitted(true);
    } catch (e) {
      setErrors({ submit: e.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Progress percentage format
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ──────────────────────────────────────
  // SUCCESS SCREEN
  // ──────────────────────────────────────
  if (submitted) {
    return (
      <View style={s.successContainer}>
        <View style={s.successCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={s.successIconCircle}
          >
            <Ionicons name="checkmark-done" size={44} color="#fff" />
          </LinearGradient>
          <Text style={s.successTitle}>🎉 Preferences Registered!</Text>
          <Text style={s.successSubtitle}>
            Thank you, {formData.name?.split(' ')[0] || 'Student'}! We have captured your academic preferences.
          </Text>
          <View style={s.successDivider} />
          
          <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={s.successHighlightText}>We will connect to you soon!</Text>
          <Text style={s.successSecondaryText}>
            Our expert counselor will call you on your registered mobile number ({formData.phone}) to schedule your free guidance session.
          </Text>
          
          <TouchableOpacity style={s.successBtn} onPress={() => navigation.navigate('HomeMain')}>
            <Text style={s.successBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      {/* Custom Header with back button & title */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Discovery Path</Text>
          <Text style={s.headerSub}>Help us customize your mentorship</Text>
        </View>
        <View style={s.stepBadge}>
          <Text style={s.stepBadgeText}>{step + 1} / 5</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={s.progressBarBackground}>
        <Animated.View style={[s.progressBarFill, { width: progressWidth }]} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          
          {/* STEP 0: CLASS SELECTION */}
          {step === 0 && (
            <View>
              <Text style={s.questionTitle}>Which class are you in? 🏫</Text>
              <Text style={s.questionSub}>Select your current grade to view relevant programs.</Text>

              {CLASSES.map((item) => {
                const isSelected = selectedClass === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      s.selectionCard,
                      isSelected && { borderColor: item.text, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }
                    ]}
                    onPress={() => handleSelectOption(item.id, setSelectedClass, 1)}
                  >
                    <View style={[s.emojiCircle, { backgroundColor: item.bg }]}>
                      <Text style={s.emojiText}>{item.emoji}</Text>
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={[s.cardTitle, isSelected && { color: item.text, fontWeight: '800' }]}>
                        {item.label}
                      </Text>
                      <Text style={s.cardSub}>{item.sub}</Text>
                    </View>
                    <View style={[
                      s.checkOuter, 
                      isSelected && { borderColor: item.text, backgroundColor: item.text }
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 1: GOAL SELECTION */}
          {step === 1 && (
            <View>
              <Text style={s.questionTitle}>What is your target goal? 🚀</Text>
              <Text style={s.questionSub}>Select the primary exam or area you want guidance in.</Text>

              {GOALS.map((item) => {
                const isSelected = selectedGoal === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      s.selectionCard,
                      isSelected && { borderColor: item.text, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }
                    ]}
                    onPress={() => handleSelectOption(item.id, setSelectedGoal, 2)}
                  >
                    <View style={[s.emojiCircle, { backgroundColor: item.bg }]}>
                      <Text style={s.emojiText}>{item.emoji}</Text>
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={[s.cardTitle, isSelected && { color: item.text, fontWeight: '800' }]}>
                        {item.label}
                      </Text>
                      <Text style={s.cardSub}>{item.sub}</Text>
                    </View>
                    <View style={[
                      s.checkOuter,
                      isSelected && { borderColor: item.text, backgroundColor: item.text }
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 2: PREFERRED STUDY MODE */}
          {step === 2 && (
            <View>
              <Text style={s.questionTitle}>How do you want to learn? 💡</Text>
              <Text style={s.questionSub}>Choose your preferred method of study & mentorship support.</Text>

              {STUDY_MODES.map((item) => {
                const isSelected = selectedMode === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      s.selectionCard,
                      isSelected && { borderColor: item.border, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }
                    ]}
                    onPress={() => handleSelectOption(item.id, setSelectedMode, 3)}
                  >
                    <View style={[s.emojiCircle, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={22} color={item.border} />
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={[s.cardTitle, isSelected && { color: item.border, fontWeight: '800' }]}>
                        {item.label}
                      </Text>
                      <Text style={s.cardSub}>{item.sub}</Text>
                    </View>
                    <View style={[
                      s.checkOuter,
                      isSelected && { borderColor: item.border, backgroundColor: item.border }
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 3: MAIN CHALLENGE */}
          {step === 3 && (
            <View>
              <Text style={s.questionTitle}>What is your biggest study challenge? 🎯</Text>
              <Text style={s.questionSub}>This helps our mentors address your exact requirements.</Text>

              {CHALLENGES.map((item) => {
                const isSelected = selectedChallenge === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      s.selectionCard,
                      isSelected && { borderColor: item.text, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.03)' }
                    ]}
                    onPress={() => handleSelectOption(item.id, setSelectedChallenge, 4)}
                  >
                    <View style={[s.emojiCircle, { backgroundColor: item.bg }]}>
                      <Text style={s.emojiText}>{item.emoji}</Text>
                    </View>
                    <View style={s.cardInfo}>
                      <Text style={[s.cardTitle, isSelected && { color: item.text, fontWeight: '800' }]}>
                        {item.label}
                      </Text>
                      <Text style={s.cardSub}>{item.sub}</Text>
                    </View>
                    <View style={[
                      s.checkOuter,
                      isSelected && { borderColor: item.text, backgroundColor: item.text }
                    ]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 4: REVIEW & VERIFY */}
          {step === 4 && (
            <View style={{ gap: 20 }}>
              <Text style={s.questionTitle}>Review & Confirm Details 📝</Text>
              <Text style={s.questionSub}>Just review your interests and contact info to request counseling.</Text>

              {/* Selections Summary Grid */}
              <View style={s.summaryCard}>
                <Text style={s.summaryCardTitle}>📋 Your Selected Path</Text>
                
                <View style={s.summaryRow}>
                  <View style={s.summaryItem}>
                    <Text style={s.summaryLabel}>Grade / Class</Text>
                    <Text style={s.summaryValue}>
                      {CLASSES.find(c => c.id === selectedClass)?.emoji} {CLASSES.find(c => c.id === selectedClass)?.label || 'Not set'}
                    </Text>
                  </View>
                  <View style={s.summaryItem}>
                    <Text style={s.summaryLabel}>Target Exam</Text>
                    <Text style={s.summaryValue}>
                      {GOALS.find(g => g.id === selectedGoal)?.emoji} {GOALS.find(g => g.id === selectedGoal)?.label || 'Not set'}
                    </Text>
                  </View>
                </View>

                <View style={s.summaryDivider} />

                <View style={s.summaryRow}>
                  <View style={s.summaryItem}>
                    <Text style={s.summaryLabel}>Study Style</Text>
                    <Text style={s.summaryValue}>
                      {STUDY_MODES.find(m => m.id === selectedMode)?.emoji} {STUDY_MODES.find(m => m.id === selectedMode)?.label || 'Not set'}
                    </Text>
                  </View>
                  <View style={s.summaryItem}>
                    <Text style={s.summaryLabel}>Core Bottleneck</Text>
                    <Text style={s.summaryValue}>
                      {CHALLENGES.find(ch => ch.id === selectedChallenge)?.emoji} {CHALLENGES.find(ch => ch.id === selectedChallenge)?.label || 'Not set'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={s.editPrefBtn} onPress={() => goTo(0)}>
                  <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                  <Text style={s.editPrefText}>Edit preferences</Text>
                </TouchableOpacity>
              </View>

              {/* Contact Information Form */}
              <View style={s.formCard}>
                <Text style={s.formCardTitle}>📞 Contact Information</Text>
                <Text style={s.formCardSub}>Mentors will reach out on these credentials.</Text>

                {errors.submit && (
                  <View style={s.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={s.errorBannerText}>{errors.submit}</Text>
                  </View>
                )}

                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Name</Text>
                  <View style={[s.inputWrap, errors.name && s.inputError]}>
                    <Ionicons name="person-outline" size={18} color={colors.textLight} />
                    <TextInput
                      style={s.textInput}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.textLight}
                      value={formData.name}
                      onChangeText={(v) => updateField('name', v)}
                    />
                  </View>
                  {errors.name && <Text style={s.errText}>{errors.name}</Text>}
                </View>

                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>WhatsApp / Mobile Number</Text>
                  <View style={[s.inputWrap, errors.phone && s.inputError]}>
                    <Ionicons name="call-outline" size={18} color={colors.textLight} />
                    <TextInput
                      style={s.textInput}
                      placeholder="10 digit number"
                      placeholderTextColor={colors.textLight}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={formData.phone}
                      onChangeText={(v) => updateField('phone', v)}
                    />
                  </View>
                  {errors.phone && <Text style={s.errText}>{errors.phone}</Text>}
                </View>

                <View style={s.inputGroup}>
                  <Text style={s.inputLabel}>Email ID</Text>
                  <View style={[s.inputWrap, errors.email && s.inputError]}>
                    <Ionicons name="mail-outline" size={18} color={colors.textLight} />
                    <TextInput
                      style={s.textInput}
                      placeholder="name@email.com"
                      placeholderTextColor={colors.textLight}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(v) => updateField('email', v)}
                    />
                  </View>
                  {errors.email && <Text style={s.errText}>{errors.email}</Text>}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={s.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={s.submitBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={s.submitBtnText}>Submit Details</Text>
                      <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  stepBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: 18,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  questionSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emojiText: {
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cardSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
  checkOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryItem: {
    flex: 1,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  editPrefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 12,
    backgroundColor: colors.primary + '05',
  },
  editPrefText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  formCardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  errText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 6,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '850',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  successDivider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  successHighlightText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSecondaryText: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  successBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  successBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdmissionScreen;
