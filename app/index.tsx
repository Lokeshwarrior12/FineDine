import { useColors, useIsDark } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChefHat, Sparkles, Utensils } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const isDark = useIsDark();
  const { user, profile, loading } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Auto-redirect if already logged in
    if (!loading && user && profile) {
      const destination = profile.user_type === 'customer' 
        ? '/(customer)/home' 
        : '/(restaurant)/dashboard';
      router.replace(destination as any);
    }
  }, [loading, user, profile]);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCustomerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/login?type=customer' as any);
  };

  const handleRestaurantPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/login?type=restaurant_owner' as any);
  };

  const handlePartnerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signup?type=restaurant_owner' as any);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.end]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Utensils size={60} color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDark 
        ? ['#1F2937', '#111827', '#0F172A']
        : [colors.gradient.start, colors.gradient.end, '#DC2626']
      }
      style={styles.container}
    >
      {/* Decorative Background Elements */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Utensils size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>FineDine</Text>
          <View style={styles.taglineContainer}>
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.tagline}>Discover • Dine • Save</Text>
            <Sparkles size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Customer Card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={handleCustomerPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <Utensils size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>I'm a Customer</Text>
              <Text style={styles.cardSubtitle}>
                Discover amazing deals and save on dining
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Restaurant Owner Card */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={handleRestaurantPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#1F2937', '#374151']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <ChefHat size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.cardTitle}>Restaurant Owner</Text>
              <Text style={styles.cardSubtitle}>
                Manage your restaurant and attract customers
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Become a Partner Link */}
        <TouchableOpacity 
          onPress={handlePartnerPress}
          style={styles.partnerLink}
        >
          <Text style={styles.partnerText}>
            Become a Partner Restaurant
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 FineDine. All rights reserved.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: '40%',
    right: -75,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    padding: 24,
    minHeight: 160,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  partnerLink: {
    marginTop: 32,
    alignItems: 'center',
    padding: 16,
  },
  partnerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});