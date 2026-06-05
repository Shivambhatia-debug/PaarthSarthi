import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import colors from '../../constants/colors';
import GradientHeader from '../../components/GradientHeader';

const COACHING_INSTITUTES = [
  'ParthSarthi Knowledge Hub',
  'Allen Career Institute',
  'Physics Wallah (PW)',
  'Resonance',
  'FIITJEE',
  'Aakash Institute',
  'Other / Self-Guided',
];

const COURSES = [
  'JEE (Main + Advanced) Prep',
  'NEET-UG Prep',
  'Foundation Course (Class 9-10)',
  'Psychometric Counseling & Stream Selection',
  'Career Mentorship & Internship Prep',
  'Board Exam Prep (CBSE/ICSE/State)',
  'Other Specialization',
];

const BOARDS = ['CBSE', 'ICSE', 'Bihar Board', 'UP Board', 'Other'];
const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'College Graduate', 'Other'];
const STREAMS = ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts', 'General / None'];

const AdmissionScreen = ({ navigation }) => {
  const { user } = useAuth();
  
  // States
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Form Fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    parentName: '',
    parentPhone: '',
    city: '',
    state: '',
    currentClass: '',
    board: '',
    schoolName: '',
    stream: '',
    yearOfPassing: '',
    coachingInstitute: '',
    course: '',
    mode: 'both', // default
    additionalNotes: '',
  });

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

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    if (formData.parentPhone && !/^\d{10}$/.test(formData.parentPhone.replace(/[^0-9]/g, ''))) {
      newErrors.parentPhone = 'Parent phone must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.coachingInstitute) newErrors.coachingInstitute = 'Please select a coaching institute';
    if (!formData.course) newErrors.course = 'Please select your target course';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setLoading(true);
    try {
      // Clean phone numbers
      const payload = {
        ...formData,
        phone: formData.phone.replace(/[^0-9]/g, ''),
        parentPhone: formData.parentPhone.replace(/[^0-9]/g, ''),
      };
      
      await api.post('/admissions', payload);
      setSubmitted(true);
    } catch (e) {
      console.error('Admission submission error:', e);
      setErrors({ submit: e.response?.data?.message || 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Render Step Indicators
  const renderStepIndicator = () => (
    <View style={styles.indicatorContainer}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
        </View>
        <Text style={[styles.indicatorLabel, step === 1 && styles.indicatorLabelActive]}>Contact</Text>
      </View>
      
      <View style={[styles.connector, step >= 2 && styles.connectorActive]} />

      <View style={styles.stepIndicator}>
        <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
        </View>
        <Text style={[styles.indicatorLabel, step === 2 && styles.indicatorLabelActive]}>Academic</Text>
      </View>

      <View style={[styles.connector, step >= 3 && styles.connectorActive]} />

      <View style={styles.stepIndicator}>
        <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, step >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
        <Text style={[styles.indicatorLabel, step === 3 && styles.indicatorLabelActive]}>Program</Text>
      </View>
    </View>
  );

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-done" size={48} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your admission counseling request has been registered. Our career counselors will reach out to you within 24 hours.
          </Text>
          
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('HomeMain')}
          >
            <Text style={styles.doneBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <GradientHeader title="Apply for Admission" subtitle="Auto-filled from your profile details" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStepIndicator()}

        {errors.submit && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
            <Text style={styles.errorBannerText}>{errors.submit}</Text>
          </View>
        )}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Personal & Contact Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textLight}
                  value={formData.name}
                  onChangeText={(val) => updateField('name', val)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => updateField('email', val)}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                <Ionicons name="call-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.phone}
                  onChangeText={(val) => updateField('phone', val)}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., Patna"
                    placeholderTextColor={colors.textLight}
                    value={formData.city}
                    onChangeText={(val) => updateField('city', val)}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., Bihar"
                    placeholderTextColor={colors.textLight}
                    value={formData.state}
                    onChangeText={(val) => updateField('state', val)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Parent's Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter father / mother name"
                  placeholderTextColor={colors.textLight}
                  value={formData.parentName}
                  onChangeText={(val) => updateField('parentName', val)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Parent's Phone Number</Text>
              <View style={[styles.inputWrapper, errors.parentPhone && styles.inputError]}>
                <Ionicons name="call-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.parentPhone}
                  onChangeText={(val) => updateField('parentPhone', val)}
                />
              </View>
              {errors.parentPhone && <Text style={styles.errorText}>{errors.parentPhone}</Text>}
            </View>
          </View>
        )}

        {/* Step 2: Academic Details */}
        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Academic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Grade / Status</Text>
              <View style={styles.chipContainer}>
                {CLASSES.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.chip, formData.currentClass === cls && styles.chipActive]}
                    onPress={() => updateField('currentClass', cls)}
                  >
                    <Text style={[styles.chipText, formData.currentClass === cls && styles.chipTextActive]}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Educational Board</Text>
              <View style={styles.chipContainer}>
                {BOARDS.map((bd) => (
                  <TouchableOpacity
                    key={bd}
                    style={[styles.chip, formData.board === bd && styles.chipActive]}
                    onPress={() => updateField('board', bd)}
                  >
                    <Text style={[styles.chipText, formData.board === bd && styles.chipTextActive]}>
                      {bd}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Academic Stream</Text>
              <View style={styles.chipContainer}>
                {STREAMS.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.chip, formData.stream === st && styles.chipActive]}
                    onPress={() => updateField('stream', st)}
                  >
                    <Text style={[styles.chipText, formData.stream === st && styles.chipTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>School / College Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter school or college name"
                  placeholderTextColor={colors.textLight}
                  value={formData.schoolName}
                  onChangeText={(val) => updateField('schoolName', val)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year of Passing</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E.g., 2026"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  maxLength={4}
                  value={formData.yearOfPassing}
                  onChangeText={(val) => updateField('yearOfPassing', val)}
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Coaching / Course Preference */}
        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Coaching Preferences</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Coaching Institute <Text style={styles.required}>*</Text></Text>
              <View style={styles.listSelector}>
                {COACHING_INSTITUTES.map((inst) => (
                  <TouchableOpacity
                    key={inst}
                    style={[
                      styles.listItem,
                      formData.coachingInstitute === inst && styles.listItemActive,
                    ]}
                    onPress={() => updateField('coachingInstitute', inst)}
                  >
                    <Ionicons
                      name={formData.coachingInstitute === inst ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={formData.coachingInstitute === inst ? colors.primary : colors.textLight}
                    />
                    <Text style={[styles.listItemText, formData.coachingInstitute === inst && styles.listItemTextActive]}>
                      {inst}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.coachingInstitute && <Text style={styles.errorText}>{errors.coachingInstitute}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Program / Course <Text style={styles.required}>*</Text></Text>
              <View style={styles.listSelector}>
                {COURSES.map((crs) => (
                  <TouchableOpacity
                    key={crs}
                    style={[
                      styles.listItem,
                      formData.course === crs && styles.listItemActive,
                    ]}
                    onPress={() => updateField('course', crs)}
                  >
                    <Ionicons
                      name={formData.course === crs ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={formData.course === crs ? colors.primary : colors.textLight}
                    />
                    <Text style={[styles.listItemText, formData.course === crs && styles.listItemTextActive]}>
                      {crs}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Study Mode</Text>
              <View style={styles.row}>
                {['online', 'offline', 'both'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.modeBtn,
                      formData.mode === m && styles.modeBtnActive,
                    ]}
                    onPress={() => updateField('mode', m)}
                  >
                    <Text style={[styles.modeBtnText, formData.mode === m && styles.modeBtnTextActive]}>
                      {m.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Additional Queries (Optional)</Text>
              <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                <TextInput
                  style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                  placeholder="Share details or coupon discount batch questions..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={formData.additionalNotes}
                  onChangeText={(val) => updateField('additionalNotes', val)}
                />
              </View>
            </View>
          </View>
        )}

        {/* Navigation Actions */}
        <View style={styles.actionRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={handlePrev} disabled={loading}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next Step</Text>
              <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Submit Form</Text>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
  stepNumberActive: {
    color: colors.primary,
  },
  indicatorLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight,
  },
  indicatorLabelActive: {
    color: colors.textWhite,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  connectorActive: {
    backgroundColor: colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.textWhite,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  listSelector: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  listItemText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listItemTextActive: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  modeBtn: {
    flex: 1,
    height: 40,
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modeBtnActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  modeBtnTextActive: {
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  // Success Screen Styles
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
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdmissionScreen;
