import { useColors } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChefHat, Eye, EyeOff, Lock, Mail, MapPin, Phone, User, Utensils, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const colors = useColors();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCustomer = type === 'customer';
  const Icon = isCustomer ? Utensils : ChefHat;

  const validateForm = () => {
    const { fullName, email, phone, address, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }

    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        user_type: type as 'customer' | 'restaurant_owner',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Success!',
        'Your account has been created. Please sign in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace(`/(auth)/login?type=${type}` as any),
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`/(auth)/login?type=${type}` as any);
  };

  return (
    <LinearGradient
      colors={isCustomer 
        ? [colors.gradient.start, colors.gradient.end]
        : ['#1F2937', '#111827']
      }
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Icon size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {isCustomer ? 'Start discovering amazing deals' : 'Grow your restaurant business'}
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <User size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textLight}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Mail size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textLight}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Phone size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.textLight}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Address</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <MapPin size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="123 Main St, City"
                  placeholderTextColor={colors.textLight}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Lock size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textLight}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textLight} />
                  ) : (
                    <Eye size={20} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                <Lock size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textLight}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.textLight} />
                  ) : (
                    <Eye size={20} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                style={styles.signupButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              By signing up, you agree to our{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  signupButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  signupButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});