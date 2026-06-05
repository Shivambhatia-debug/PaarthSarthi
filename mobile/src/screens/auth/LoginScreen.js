import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  // Inputs & Focus States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Background drifting bubble animations (Green, Blue, Amber)
  const bubble1X = useRef(new Animated.Value(0)).current;
  const bubble1Y = useRef(new Animated.Value(0)).current;
  const bubble2X = useRef(new Animated.Value(0)).current;
  const bubble2Y = useRef(new Animated.Value(0)).current;
  const bubble3X = useRef(new Animated.Value(0)).current;
  const bubble3Y = useRef(new Animated.Value(0)).current;

  // Card backing aura pulse animation
  const auraOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    // Trigger entrance transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for card backdrop aura
    const runPulse = () => {
      Animated.sequence([
        Animated.timing(auraOpacity, { toValue: 0.65, duration: 3000, useNativeDriver: true }),
        Animated.timing(auraOpacity, { toValue: 0.35, duration: 3000, useNativeDriver: true }),
      ]).start(() => runPulse());
    };
    runPulse();

    // Loop movement for Green Bubble
    const runBubble1 = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble1X, { toValue: 110, duration: 10000, useNativeDriver: true }),
          Animated.timing(bubble1Y, { toValue: 80, duration: 10000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubble1X, { toValue: -60, duration: 12000, useNativeDriver: true }),
          Animated.timing(bubble1Y, { toValue: 160, duration: 12000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubble1X, { toValue: 0, duration: 10000, useNativeDriver: true }),
          Animated.timing(bubble1Y, { toValue: 0, duration: 10000, useNativeDriver: true }),
        ]),
      ]).start(() => runBubble1());
    };

    // Loop movement for Blue Bubble
    const runBubble2 = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble2X, { toValue: -90, duration: 11000, useNativeDriver: true }),
          Animated.timing(bubble2Y, { toValue: 110, duration: 11000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubble2X, { toValue: 70, duration: 13000, useNativeDriver: true }),
          Animated.timing(bubble2Y, { toValue: -60, duration: 13000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubble2X, { toValue: 0, duration: 11000, useNativeDriver: true }),
          Animated.timing(bubble2Y, { toValue: 0, duration: 11000, useNativeDriver: true }),
        ]),
      ]).start(() => runBubble2());
    };

    // Loop movement for Amber Bubble
    const runBubble3 = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble3X, { toValue: 70, duration: 12000, useNativeDriver: true }),
          Animated.timing(bubble3Y, { toValue: -100, duration: 12000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubble3X, { toValue: -80, duration: 10000, useNativeDriver: true }),
          Animated.timing(bubble3Y, { toValue: 70, duration: 10000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubble3X, { toValue: 0, duration: 12000, useNativeDriver: true }),
          Animated.timing(bubble3Y, { toValue: 0, duration: 12000, useNativeDriver: true }),
        ]),
      ]).start(() => runBubble3());
    };

    runBubble1();
    runBubble2();
    runBubble3();
  }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'Invalid credentials');
    }
  };

  const isFormActive = emailFocused || passwordFocused;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Floating Background Glow Bubbles (Three-color Aurora) */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[
          styles.bubble,
          styles.bubblePrimary,
          {
            transform: [
              { translateX: bubble1X },
              { translateY: bubble1Y }
            ]
          }
        ]} />
        <Animated.View style={[
          styles.bubble,
          styles.bubbleBlue,
          {
            transform: [
              { translateX: bubble2X },
              { translateY: bubble2Y }
            ]
          }
        ]} />
        <Animated.View style={[
          styles.bubble,
          styles.bubbleAmber,
          {
            transform: [
              { translateX: bubble3X },
              { translateY: bubble3Y }
            ]
          }
        ]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Animated Header Section (Typographic only, icon removed) */}
          <Animated.View style={[styles.brandSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.appName}>
              ParthSarthi<Text style={{ color: colors.primary }}>.</Text>
            </Text>
            <Text style={styles.tagline}>Accelerate your career journey</Text>
          </Animated.View>

          {/* Animated Form Card Wrapper with Pulsing Glow Backdrop */}
          <View style={styles.cardContainer}>
            <Animated.View style={[styles.cardAura, { opacity: auraOpacity }]} />
            
            <Animated.View style={[
              styles.formSection,
              isFormActive && styles.formSectionActive,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              <Text style={styles.formTitle}>Welcome Back 👋</Text>
              <Text style={styles.formSubtitle}>Login to continue your journey</Text>

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                  errors.email && styles.inputContainerError
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={emailFocused ? colors.primary : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="name@email.com"
                    placeholderTextColor={colors.textLight}
                    value={email}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChangeText={(t) => {
                      setEmail(t);
                      setErrors(prev => ({ ...prev, email: null }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                  errors.password && styles.inputContainerError
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={passwordFocused ? colors.primary : colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textLight}
                    value={password}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onChangeText={(t) => {
                      setPassword(t);
                      setErrors(prev => ({ ...prev, password: null }));
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Login Button */}
              <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginBtn, loading && styles.btnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.loginBtnText}>Login</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 200,
  },
  bubblePrimary: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    top: '10%',
    left: '-15%',
  },
  bubbleBlue: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    bottom: '22%',
    right: '-20%',
  },
  bubbleAmber: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    top: '45%',
    right: '-10%',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textWhite,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 5,
    fontWeight: '500',
  },
  cardContainer: {
    position: 'relative',
    padding: 4,
  },
  cardAura: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 24,
    filter: Platform.OS === 'ios' ? 'blur(25px)' : undefined,
    zIndex: -1,
  },
  formSection: {
    backgroundColor: 'rgba(13, 17, 23, 0.85)', // Glassmorphic translucent card
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  formSectionActive: {
    borderColor: 'rgba(16, 185, 129, 0.22)',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 3,
  },
  formSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 34, 0.65)',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 13.5,
    color: colors.textWhite,
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    fontSize: 10.5,
    color: colors.error,
    marginTop: 3,
    marginLeft: 3,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerText: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default LoginScreen;
