import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';
import config from '../../constants/config';
import storage from '../../utils/storage';
import { getInitials } from '../../utils/helpers';
import api from '../../api/axios';

const EditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUser, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    language: user?.language || 'en',
  });

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${config.API_BASE_URL}${avatar}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri) => {
    setLoading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('avatar', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename || 'avatar.jpg',
        type,
      });

      const response = await api.put('/auth/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        await storage.setUser(updatedUser);
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      Alert.alert('Upload Failed', err.message || 'Could not upload profile photo.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    const result = await updateUser(form);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Profile updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      Alert.alert('Error', result.message || 'Failed to update profile');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: getAvatarUrl(user.avatar) }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.avatarEditBtn} onPress={pickImage} disabled={loading} activeOpacity={0.8}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap camera to change photo</Text>
        </View>

        {/* Name */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(t) => updateForm('name', t)}
            placeholder="Your name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(t) => updateForm('phone', t)}
            placeholder="Phone number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Bio */}
        <Text style={styles.label}>Bio</Text>
        <View style={[styles.inputContainer, { height: 100 }]}>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
            value={form.bio}
            onChangeText={(t) => updateForm('bio', t)}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{form.bio.length}/500</Text>

        {/* Language */}
        <Text style={styles.label}>Language</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langChip, form.language === 'en' && styles.langChipActive]}
            onPress={() => updateForm('language', 'en')}
          >
            <Text style={[styles.langText, form.language === 'en' && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, form.language === 'hi' && styles.langChipActive]}
            onPress={() => updateForm('language', 'hi')}
          >
            <Text style={[styles.langText, form.language === 'hi' && styles.langTextActive]}>हिंदी</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: colors.textPrimary,
  },
  charCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  langChipActive: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  langText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.primary,
  },
  saveBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    marginTop: 30,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryFaded,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
});

export default EditProfileScreen;
