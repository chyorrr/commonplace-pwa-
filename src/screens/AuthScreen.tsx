import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, StatusBar } from 'react-native';
import { useApp, UserProfile, ThemeMode } from '../context/AppContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Tape } from '../components/common/Tape';
import { ArrowRight, Lock, Mail, User, Check, Camera, ChevronLeft } from 'lucide-react-native';
import { DeviceImagePicker } from '../components/common/DeviceImagePicker';
import { UserAvatar } from '../components/common/UserAvatar';
import { AVATAR_PRESETS } from '../data/avatarPresets';
import { reminderService } from '../services/reminderService';

interface ThemeOption {
  id: ThemeMode;
  name: string;
  subtitle: string;
  bgHex: string;
  accentHex: string;
  swatch: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'sakura', name: 'Sakura Blossom', subtitle: 'Soft cherry blossom & blush', bgHex: '#FFF2F6', accentHex: '#E11D48', swatch: '#FFE4EE' },
  { id: 'lilac', name: 'Fairy Lilac', subtitle: 'Dreamy lavender mist', bgHex: '#F7F2FF', accentHex: '#7C3AED', swatch: '#EDE8FF' },
  { id: 'matcha', name: 'Matcha Cloud', subtitle: 'Fresh sage & botanical green', bgHex: '#F2F8F4', accentHex: '#16A34A', swatch: '#DCFCE7' },
  { id: 'butter', name: 'Honey Butter', subtitle: 'Warm cozy vanilla cream', bgHex: '#FFFDF0', accentHex: '#D97706', swatch: '#FEF3C7' },
  { id: 'peach', name: 'Sweet Peach', subtitle: 'Sun-kissed coral glow', bgHex: '#FFF4EF', accentHex: '#EA580C', swatch: '#FFEDD5' },
  { id: 'sky', name: 'Baby Blue', subtitle: 'Airy morning sky & cloud', bgHex: '#F0F7FF', accentHex: '#0284C7', swatch: '#E0F2FE' },
  { id: 'dark', name: 'Midnight Noir', subtitle: 'Late night velvet & neon lilac', bgHex: '#16131D', accentHex: '#C084FC', swatch: '#2E1E3F' },
];

export const AuthScreen: React.FC = () => {
  const { login, savedAccounts, setThemeMode, themeMode } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authStep, setAuthStep] = useState<'form' | 'theme'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('avatar:camera');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode || 'sakura');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  // Quick select a saved account -> go to theme selection first
  const handleSelectSavedAccount = (acc: UserProfile) => {
    setPendingUser(acc);
    setErrorMsg('');
    setAuthStep('theme');
  };

  // Sign in form validation -> go to theme selection first
  const handleSignInProceed = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');

    const existing = savedAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setPendingUser(existing);
    } else {
      const userDisplayName = email.split('@')[0] || 'Collector';
      setPendingUser({
        id: `user-${Date.now()}`,
        email: email.trim(),
        name: userDisplayName,
        bio: 'Scrapbook Collector',
        avatarUrl: 'avatar:camera',
      });
    }
    setAuthStep('theme');
  };

  // Create account form validation -> go to theme selection first
  const handleSignupProceed = () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    setErrorMsg('');

    const userDisplayName = name.trim() || email.split('@')[0] || 'Collector';
    setPendingUser({
      id: `user-${Date.now()}`,
      email: email.trim(),
      name: userDisplayName,
      bio: 'Scrapbook Collector',
      avatarUrl: selectedAvatar,
    });
    setAuthStep('theme');
  };

  // Confirm theme and enter the scrapbook app
  const handleConfirmThemeAndEnter = () => {
    if (!pendingUser) return;

    // Apply chosen theme
    setThemeMode(selectedTheme);

    // Complete login
    login(pendingUser);

    // Subtle floating notification
    const themeName = THEME_OPTIONS.find((t) => t.id === selectedTheme)?.name || 'Custom';
    setTimeout(() => {
      reminderService.showToast(
        'Atmosphere Selected',
        `Theme set to ${themeName}. You can change it anytime in Settings.`
      );
    }, 400);
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
      <View style={[styles.bgBlob, styles.blobButter]} />

      {/* Main Auth Paper Card */}
      <View style={styles.authCard}>
        <Tape variant="top-center" width={56} height={14} color="rgba(251, 113, 133, 0.85)" />

        {/* Brand Header */}
        <View style={styles.headerGroup}>
          <View style={styles.titleRow}>
            <Text style={styles.brandCommon}>common</Text>
            <Text style={styles.brandPlace}>place</Text>
          </View>
          <Text style={styles.brandSubtitle}>Things worth keeping</Text>
        </View>

        {/* Step 1: Form Inputs & Saved Accounts */}
        {authStep === 'form' ? (
          <>
            {/* Saved Profiles 1-Tap Quick Switch */}
            {mode === 'login' && savedAccounts && savedAccounts.length > 0 && (
              <View style={styles.savedProfilesWrap}>
                <Text style={styles.savedProfilesTitle}>Continue as:</Text>
                <View style={styles.savedAccountsRow}>
                  {savedAccounts.map((acc: UserProfile) => (
                    <Pressable
                      key={acc.id}
                      onPress={() => handleSelectSavedAccount(acc)}
                      style={({ pressed }) => [styles.quickAccBtn, pressed && styles.btnPressed]}
                    >
                      <UserAvatar avatarUrl={acc.avatarUrl} name={acc.name} size={32} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.quickAccName} numberOfLines={1}>{acc.name}</Text>
                        <Text style={styles.quickAccEmail} numberOfLines={1}>{acc.email}</Text>
                      </View>
                      <ArrowRight size={14} color={colors.brand.purpleDark} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

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
                  {/* Avatar Selection Block */}
                  <View style={styles.avatarSection}>
                    <Text style={styles.fieldLabel}>Choose Avatar or Upload Photo</Text>
                    <View style={styles.avatarPickerRow}>
                      <View style={styles.previewAvatarWrap}>
                        <UserAvatar avatarUrl={selectedAvatar} name={name || 'User'} size={52} />
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.avatarScrollContent}
                      >
                        {AVATAR_PRESETS.map((preset) => {
                          const isSelected = selectedAvatar === preset.id;
                          return (
                            <Pressable
                              key={preset.id}
                              onPress={() => setSelectedAvatar(preset.id)}
                              style={[
                                styles.presetAvatarBtn,
                                { backgroundColor: preset.bg, borderColor: isSelected ? colors.brand.purpleDark : preset.border },
                                isSelected && styles.presetAvatarSelected,
                              ]}
                            >
                              <UserAvatar avatarUrl={preset.id} size={30} showBorder={false} />
                              {isSelected && (
                                <View style={styles.avatarCheckBadge}>
                                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                                </View>
                              )}
                            </Pressable>
                          );
                        })}

                        {/* Custom Image Upload Option */}
                        <DeviceImagePicker
                          onImageSelected={(base64) => setSelectedAvatar(base64)}
                          style={styles.uploadAvatarBtn}
                        >
                          <Camera size={16} color={colors.ink.secondary} />
                          <Text style={styles.uploadAvatarText}>Photo</Text>
                        </DeviceImagePicker>
                      </ScrollView>
                    </View>
                  </View>

                  {/* Name Input */}
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

              {/* Email Input */}
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

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Lock size={16} color={colors.ink.tertiary} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.ink.faded}
                  style={styles.textInput}
                  secureTextEntry
                />
              </View>

              {Boolean(errorMsg) && (
                <Text style={styles.errorText}>{errorMsg}</Text>
              )}

              {/* Proceed Button */}
              <Pressable
                onPress={mode === 'signup' ? handleSignupProceed : handleSignInProceed}
                style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.submitBtnText}>
                  {mode === 'signup' ? 'Choose Theme' : 'Choose Theme & Sign In'}
                </Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
          </>
        ) : (
          /* Step 2: Choose Theme Atmosphere First */
          <View style={styles.themeStepWrap}>
            <View style={styles.stepHeaderRow}>
              <Pressable
                onPress={() => setAuthStep('form')}
                style={styles.backStepBtn}
                hitSlop={8}
              >
                <ChevronLeft size={20} color={colors.ink.primary} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.themeStepTitle}>Choose Your Atmosphere</Text>
                <Text style={styles.themeStepSubtitle}>Select your starting theme</Text>
              </View>
            </View>

            {/* Profile Confirmation Pill */}
            {Boolean(pendingUser) && (
              <View style={styles.userConfirmRow}>
                <UserAvatar avatarUrl={pendingUser?.avatarUrl} name={pendingUser?.name} size={28} />
                <Text style={styles.userConfirmText} numberOfLines={1}>
                  Signing in as <Text style={styles.boldText}>{pendingUser?.name}</Text>
                </Text>
              </View>
            )}

            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => setSelectedTheme(theme.id)}
                    style={[
                      styles.themeCard,
                      { backgroundColor: theme.bgHex },
                      isSelected && { borderColor: theme.accentHex, borderWidth: 2 },
                    ]}
                  >
                    <View style={styles.themeCardHeader}>
                      <View style={[styles.swatchCircle, { backgroundColor: theme.accentHex }]}>
                        {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                      <Text style={[styles.themeCardName, isSelected && { color: theme.accentHex }]}>
                        {theme.name}
                      </Text>
                    </View>
                    <Text style={styles.themeCardSub}>{theme.subtitle}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={handleConfirmThemeAndEnter}
              style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.submitBtnText}>Enter Commonplace</Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    minHeight: '100%',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 24 : 44,
    paddingBottom: 44,
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
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#2D1B4E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    position: 'relative',
  },
  headerGroup: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandCommon: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    fontWeight: '800',
    color: '#2D1B4E',
    letterSpacing: -0.5,
  },
  brandPlace: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    color: colors.ink.secondary,
    marginTop: 3,
  },
  savedProfilesWrap: {
    backgroundColor: '#FAF7FD',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  savedProfilesTitle: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  savedAccountsRow: {
    gap: 8,
  },
  quickAccBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  quickAccName: {
    fontFamily: typography.families.sans,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  quickAccEmail: {
    fontFamily: typography.families.sans,
    fontSize: 10.5,
    color: colors.ink.tertiary,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    padding: 3,
    borderRadius: 14,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: colors.brand.purpleDark,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formFields: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginBottom: 8,
  },
  avatarSection: {
    marginBottom: 4,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewAvatarWrap: {
    marginRight: 2,
  },
  avatarScrollContent: {
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  presetAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  presetAvatarSelected: {
    borderWidth: 2,
    transform: [{ scale: 1.06 }],
  },
  avatarCheckBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.purpleDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
  },
  uploadAvatarText: {
    fontFamily: typography.families.sans,
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.ink.secondary,
    marginTop: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7FD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: typography.families.sans,
    fontSize: 13.5,
    color: colors.ink.primary,
  },
  errorText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.brand.purpleDark,
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontFamily: typography.families.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  themeStepWrap: {
    gap: 12,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  backStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeStepTitle: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  themeStepSubtitle: {
    fontFamily: typography.families.sans,
    fontSize: 11.5,
    color: colors.ink.secondary,
  },
  userConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF7FD',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  userConfirmText: {
    fontFamily: typography.families.sans,
    fontSize: 12,
    color: colors.ink.secondary,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: colors.brand.purpleDark,
  },
  themeGrid: {
    gap: 8,
    maxHeight: 280,
  },
  themeCard: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
  },
  themeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  swatchCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCardName: {
    fontFamily: typography.families.sans,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink.primary,
  },
  themeCardSub: {
    fontFamily: typography.families.sans,
    fontSize: 11,
    color: colors.ink.secondary,
    marginLeft: 24,
  },
});
