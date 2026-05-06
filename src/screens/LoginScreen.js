import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Cross-platform alert
const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function LoginScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobile = screenWidth < 500;
  const formMaxWidth = isMobile ? screenWidth : 420;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const formSlide = useRef(new Animated.Value(100)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(formSlide, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAuth = async () => {
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    try {
      if (isLogin) {
        console.log('Attempting login with:', email.trim());
        await login(email.trim(), password);
        console.log('Login successful!');
      } else {
        console.log('Attempting registration with:', email.trim());
        await register(email.trim(), password, displayName.trim());
        console.log('Registration successful!');
      }
    } catch (error) {
      console.error('Auth error:', error.code, error.message);
      let message = 'An error occurred. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Try signing in instead.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          message = 'Password must be at least 6 characters.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email. Try signing up first.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password. Please check and try again.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Check your internet connection.';
          break;
        default:
          message = error.message || 'An unexpected error occurred.';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setDisplayName('');
    setErrorMsg('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />

      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardView, { maxWidth: formMaxWidth, width: '100%' }]}
        >
          {/* Logo & Title */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                transform: [{ scale: logoScale }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <Ionicons name="checkmark-done-circle" size={64} color={colors.primary} />
            </View>
            <Animated.Text
              style={[
                styles.title,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              TaskFlow
            </Animated.Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateY: formSlide }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Error Message */}
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Name field (register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textPlaceholder}
                  value={displayName}
                  onChangeText={(text) => { setDisplayName(text); setErrorMsg(''); }}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={colors.textPlaceholder}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrorMsg(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={colors.textPlaceholder}
                value={password}
                onChangeText={(text) => { setPassword(text); setErrorMsg(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onSubmitEditing={handleAuth}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Auth Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.authButton, loading && styles.authButtonLoading]}
                onPress={handleAuth}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.authButtonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Toggle */}
            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleTextBold}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    minHeight: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  keyboardView: {
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 101, 132, 0.06)',
    bottom: 100,
    left: -60,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    bottom: -20,
    right: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  formContainer: {
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.25)',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  eyeButton: {
    padding: 8,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 8,
    cursor: 'pointer',
  },
  authButtonLoading: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 16,
    cursor: 'pointer',
  },
  toggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toggleTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
