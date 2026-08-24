import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { useApp, UserProfile } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Tape } from '../components/common/Tape';
import { ArrowRight, Lock, Mail, User, Check, Camera } from 'lucide-react-native';
import { pickImageFromDevice } from '../utils/imagePicker';
import { DeviceImagePicker } from '../components/common/DeviceImagePicker';

export const AuthScreen: React.FC = () => {
  const { login, savedAccounts } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    const userDisplayName = name.trim() || email.split('@')[0] || 'Collector';
    login({
      id: `user-${Date.now()}`,
      email: email.trim(),
      name: userDisplayName,
      bio: 'Cozy Scrapbooker ♡',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });
  };

  const handleQuickDemo = () => {
    setErrorMsg('');
    login({
      id: 'user-demo',
      email: 'harsh@commonplace.app',
      name: 'Harsh Naik',
      bio: 'Cozy Scrapbooker ♡',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Decorative Blobs */}
      <View style={[styles.bgBlob, styles.blobRose]} />
      <View style={[styles.bgBlob, styles.blobLilac]} />
      <View style={[styles.blobButter]} />

      {/* Main Auth Paper Card */}
      <View style={styles.authCard}>
        <Tape variant="top-center" width={56} height={14} color="rgba(251, 113, 133, 0.85)" />

        {/* Brand Header */}
        <View style={styles.headerGroup}>
          <View style={styles.titleRow}>
            <Text style={styles.brandCommon}>common</Text>
            <Text style={styles.brandPlace}>place</Text>
            <Text style={styles.brandHeart}>♡</Text>
          </View>
          <Text style={styles.brandSubtitle}>Things worth keeping</Text>
        </View>

        {/* Saved Profiles 1-Tap Switch */}
        {savedAccounts && savedAccounts.length > 0 && (
          <View style={styles.savedProfilesWrap}>
            <Text style={styles.savedProfilesTitle}>Continue as:</Text>
            <View style={styles.savedAccountsRow}>
              {savedAccounts.map((acc: UserProfile) => (
                <Pressable
                  key={acc.id}
                  onPress={() => login(acc)}
                  style={({ pressed }) => [styles.quickAccBtn, pressed && styles.btnPressed]}
                >
                  <Image source={{ uri: acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }} style={styles.quickAccAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickAccName} numberOfLines={1}>{acc.name}</Text>
                    <Text style={styles.quickAccEmail} numberOfLines={1}>{acc.email}</Text>
                  </View>
                  <ArrowRight size={14} color={colors.brand.purple} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* 1-Tap Quick Demo Button */}
        <Pressable
          onPress={handleQuickDemo}
          style={({ pressed }) => [styles.quickDemoBtn, pressed && styles.btnPressed]}
        >
          <Text style={styles.quickDemoText}>Quick Demo Sign In</Text>
          <ArrowRight size={15} color="#FFFFFF" />
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or Sign In With Account</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Login / Sign Up Tabs */}
        <View style={styles.tabToggleRow}>
          <Pressable
            onPress={() => {
              setMode('login');
              setErrorMsg('');
            }}
            style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Create Account</Text>
          </Pressable>
        </View>

        {/* Input Fields */}
        <View style={styles.formFields}>
          {mode === 'signup' && (
            <>
              <View style={styles.avatarPickerRow}>
                <DeviceImagePicker onImageSelected={(base64) => setAvatarUrl(base64)} style={styles.avatarWrap}>
                  <Image
                    source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                    style={styles.avatarThumb}
                  />
                  <View style={styles.camBadge}>
                    <Camera size={11} color="#FFF" />
                  </View>
                </DeviceImagePicker>
                <Text style={styles.avatarHint}>Tap photo to upload from phone</Text>
              </View>

              <View style={styles.inputWrapper}>
                <User size={16} color={colors.ink.tertiary} style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                  placeholderTextColor={colors.ink.faded}
                  style={styles.textInput}
                />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Mail size={16} color={colors.ink.tertiary} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor={colors.ink.faded}
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={16} color={colors.ink.tertiary} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.ink.faded}
              secureTextEntry
              style={styles.textInput}
            />
          </View>

          {Boolean(errorMsg) && (
            <Text style={styles.errorText}>{errorMsg}</Text>
          )}

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.submitBtnText}>
              {mode === 'login' ? 'Sign In' : 'Create Account & Start Scrapbooking'}
            </Text>
            <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2F6',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 24 : 44,
    paddingBottom: 40,
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  blobRose: {
    width: 260,
    height: 260,
    backgroundColor: '#FFE4E6',
    top: 20,
    left: -40,
  },
  blobLilac: {
    width: 280,
    height: 280,
    backgroundColor: '#EDE9FE',
    bottom: 40,
    right: -50,
  },
  blobButter: {
    width: 200,
    height: 200,
    backgroundColor: '#FEF3C7',
    top: '40%',
    right: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    position: 'relative',
    gap: 14,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandCommon: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: '#4A1D36',
    fontWeight: '300',
    letterSpacing: -0.4,
  },
  brandPlace: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: '#E11D48',
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandHeart: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: '#FB7185',
    marginLeft: 4,
  },
  brandSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    color: colors.ink.tertiary,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  savedProfilesWrap: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  savedProfilesTitle: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.purpleDark,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  savedAccountsRow: {
    gap: 6,
  },
  quickAccBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  quickAccAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  quickAccName: {
    fontFamily: typography.families.heading,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  quickAccEmail: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
  },
  quickDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.purple,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickDemoText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
    fontWeight: '600',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  tabTextActive: {
    color: colors.brand.purpleDark,
    fontWeight: '700',
  },
  formFields: {
    gap: 10,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.brand.purple,
  },
  camBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.brand.purple,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 13,
    color: colors.ink.primary,
  },
  errorText: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E1B24',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
