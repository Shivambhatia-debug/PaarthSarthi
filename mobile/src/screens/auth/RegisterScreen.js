import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';

const EDUCATION_OPTIONS = ['Class 8-9', 'Class 10-12', 'Undergraduate', 'Postgraduate', 'Graduate', 'Working Professional'];
const STREAM_OPTIONS = ['Science', 'Commerce', 'Arts/Humanities', 'Engineering', 'Medical', 'Other'];

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
    currentEducation: '',
    institution: '',
    yearOfStudy: '',
    stream: '',
    location: '',
    designation: '',
    company: '',
    experience: '',
    bio: '',
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    const result = await register({
      ...form,
      email: form.email.trim().toLowerCase(),
      role: form.role,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.message || 'Something went wrong');
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Create Account ✨</Text>
      <Text style={styles.stepSubtitle}>Start your career guidance journey</Text>

      {/* Role Selection */}
      <Text style={styles.label}>I want to join as</Text>
      <View style={styles.roleToggleContainer}>
        <TouchableOpacity
          style={[styles.roleTab, form.role === 'student' && styles.roleTabActive]}
          onPress={() => updateForm('role', 'student')}
        >
          <Ionicons name="school-outline" size={18} color={form.role === 'student' ? '#fff' : colors.textSecondary} />
          <Text style={[styles.roleTabText, form.role === 'student' && styles.roleTabTextActive]}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleTab, form.role === 'mentor' && styles.roleTabActive]}
          onPress={() => updateForm('role', 'mentor')}
        >
          <Ionicons name="ribbon-outline" size={18} color={form.role === 'mentor' ? '#fff' : colors.textSecondary} />
          <Text style={[styles.roleTabText, form.role === 'mentor' && styles.roleTabTextActive]}>Mentor</Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.textLight}
          value={form.name}
          onChangeText={(t) => updateForm('name', t)}
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={colors.textLight}
          value={form.email}
          onChangeText={(t) => updateForm('email', t)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Phone */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone (optional)"
          placeholderTextColor={colors.textLight}
          value={form.phone}
          onChangeText={(t) => updateForm('phone', t)}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      {/* Password */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Password (min 6 chars)"
          placeholderTextColor={colors.textLight}
          value={form.password}
          onChangeText={(t) => updateForm('password', t)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionBtn}
        >
          <Text style={styles.actionBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => {
    if (form.role === 'student') {
      return (
        <>
          <Text style={styles.stepTitle}>Your Details 📚</Text>
          <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

          {/* Education */}
          <Text style={styles.label}>Current Education</Text>
          <View style={styles.optionsRow}>
            {EDUCATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionChip, form.currentEducation === opt && styles.optionChipActive]}
                onPress={() => updateForm('currentEducation', opt)}
              >
                <Text style={[styles.optionText, form.currentEducation === opt && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stream */}
          <Text style={styles.label}>Stream</Text>
          <View style={styles.optionsRow}>
            {STREAM_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionChip, form.stream === opt && styles.optionChipActive]}
                onPress={() => updateForm('stream', opt)}
              >
                <Text style={[styles.optionText, form.stream === opt && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Institution */}
          <View style={styles.inputContainer}>
            <Ionicons name="school-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Institution / School Name"
              placeholderTextColor={colors.textLight}
              value={form.institution}
              onChangeText={(t) => updateForm('institution', t)}
            />
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City / Location"
              placeholderTextColor={colors.textLight}
              value={form.location}
              onChangeText={(t) => updateForm('location', t)}
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.actionBtn, loading && styles.btnDisabled]}
              >
                <Text style={styles.actionBtnText}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.stepTitle}>Mentor Profile 🎓</Text>
          <Text style={styles.stepSubtitle}>Provide details about your expertise</Text>

          {/* Designation */}
          <View style={styles.inputContainer}>
            <Ionicons name="briefcase-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Designation (e.g. Software Engineer)"
              placeholderTextColor={colors.textLight}
              value={form.designation}
              onChangeText={(t) => updateForm('designation', t)}
            />
          </View>

          {/* Company */}
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Company / Organization"
              placeholderTextColor={colors.textLight}
              value={form.company}
              onChangeText={(t) => updateForm('company', t)}
            />
          </View>

          {/* Experience */}
          <View style={styles.inputContainer}>
            <Ionicons name="hourglass-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              placeholderTextColor={colors.textLight}
              value={form.experience}
              onChangeText={(t) => updateForm('experience', t)}
              keyboardType="number-pad"
            />
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City / Location"
              placeholderTextColor={colors.textLight}
              value={form.location}
              onChangeText={(t) => updateForm('location', t)}
            />
          </View>

          {/* Bio */}
          <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Short bio (e.g. Tell students how you can help them)"
              placeholderTextColor={colors.textLight}
              value={form.bio}
              onChangeText={(t) => updateForm('bio', t)}
              multiline
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.actionBtn, loading && styles.btnDisabled]}
              >
                <Text style={styles.actionBtnText}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress indicator */}
          <View style={styles.progress}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          <View style={styles.formCard}>
            {step === 1 ? renderStep1() : renderStep2()}
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 0,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 8,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionChipActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: colors.primary,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleTabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default RegisterScreen;
