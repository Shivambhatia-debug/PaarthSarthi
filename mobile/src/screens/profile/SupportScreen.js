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

const SupportScreen = ({ route, navigation }) => {
  const { type } = route.params || { type: 'help' };
  const { user } = useAuth();

  // Form states for 'help' mode
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSupportSubmit = async () => {
    if (!message.trim()) {
      setError('Please provide a message');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/contacts', {
        name: user?.name || 'Student',
        email: user?.email || '',
        phone: user?.phone || '9999999999',
        type: 'support',
        subject: subject.trim() || 'Support Query',
        message: message.trim(),
      });
      setSuccess(true);
    } catch (e) {
      console.error('Support submit error:', e);
      setError(e.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Help Form
  const renderHelpForm = () => {
    if (success) {
      return (
        <View style={styles.successCard}>
          <View style={styles.successIconCircle}>
            <Ionicons name="mail-open-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Query Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for reaching out. We have received your support request and will get back to you at {user?.email} shortly.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.formCard}>
        <Text style={styles.formHeading}>How can we help you?</Text>
        
        {error ? (
          <View style={styles.errorAlert}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <Text style={styles.errorAlertText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name (Auto-filled)</Text>
          <View style={[styles.inputWrapper, styles.disabledInput]}>
            <TextInput
              style={styles.input}
              value={user?.name}
              editable={false}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address (Auto-filled)</Text>
          <View style={[styles.inputWrapper, styles.disabledInput]}>
            <TextInput
              style={styles.input}
              value={user?.email}
              editable={false}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="What is this regarding?"
              placeholderTextColor={colors.textLight}
              value={subject}
              onChangeText={setSubject}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Message / Query <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start', paddingTop: 12 }]}>
            <TextInput
              style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
              placeholder="Please describe your issue or question in detail..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={5}
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                if (error) setError('');
              }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSupportSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Submit Query</Text>
              <Ionicons name="send" size={14} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Render Privacy Policy
  const renderPrivacyPolicy = () => (
    <View style={styles.docCard}>
      <Text style={styles.docTitle}>Privacy Policy</Text>
      <Text style={styles.docMeta}>Last updated: June 2026</Text>

      <Text style={styles.docSubheading}>1. Information We Collect</Text>
      <Text style={styles.docParagraph}>
        We collect information to provide better services to all our users. This includes account details like your name, email address, phone number, academic preferences, and meetings logs with mentors.
      </Text>

      <Text style={styles.docSubheading}>2. How We Use Information</Text>
      <Text style={styles.docParagraph}>
        We use the information we collect to manage your mentorship bookings, facilitate admissions processing, improve platform recommendation engines, and communicate core updates.
      </Text>

      <Text style={styles.docSubheading}>3. Information Sharing</Text>
      <Text style={styles.docParagraph}>
        We do not share personal information with companies, organizations, or individuals outside of ParthSarthi unless one of the following circumstances applies: with your explicit consent, for processing with mentors, or for legal compliance.
      </Text>

      <Text style={styles.docSubheading}>4. Data Security</Text>
      <Text style={styles.docParagraph}>
        We work hard to protect ParthSarthi and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We encrypt data buffers and require secure auth tokens.
      </Text>
    </View>
  );

  // Render Terms of Service
  const renderTermsOfService = () => (
    <View style={styles.docCard}>
      <Text style={styles.docTitle}>Terms of Service</Text>
      <Text style={styles.docMeta}>Last updated: June 2026</Text>

      <Text style={styles.docSubheading}>1. User Agreement</Text>
      <Text style={styles.docParagraph}>
        By accessing the ParthSarthi app, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the platform services.
      </Text>

      <Text style={styles.docSubheading}>2. Session Booking Rules</Text>
      <Text style={styles.docParagraph}>
        Students can book career and psychometric sessions with featured mentors. Cancellations or rescheduling requests must be submitted at least 2 hours prior to the session start time.
      </Text>

      <Text style={styles.docSubheading}>3. Student Code of Conduct</Text>
      <Text style={styles.docParagraph}>
        You agree to maintain a respectful, professional communication standard during video/audio sessions with mentors. Harassment, abuse, or inappropriate language will result in immediate profile suspension.
      </Text>

      <Text style={styles.docSubheading}>4. Limitation of Liability</Text>
      <Text style={styles.docParagraph}>
        ParthSarthi provides educational guidance and mentor recommendations. While we strive for excellence, we are not liable for individual academic outcomes or exam rankings.
      </Text>
    </View>
  );

  // Get Page Configuration
  const getPageTitle = () => {
    switch (type) {
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms of Service';
      case 'help':
      default:
        return 'Help & Support';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <GradientHeader
        title={getPageTitle()}
        subtitle="We're here to assist you"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={28} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {type === 'help' && renderHelpForm()}
        {type === 'privacy' && renderPrivacyPolicy()}
        {type === 'terms' && renderTermsOfService()}
        <View style={{ height: 20 }} />
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
  closeBtn: {
    padding: 4,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
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
  disabledInput: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: colors.textWhite,
    fontSize: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorAlertText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  // Success card styles
  successCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 30,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Doc card styles
  docCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 20,
  },
  docSubheading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
    marginTop: 16,
    marginBottom: 8,
  },
  docParagraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default SupportScreen;
