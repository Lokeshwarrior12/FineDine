import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useColors, useThemeStore } from '@/constants/themes';
import {
  Calendar, Bell, Gift, Users, Palette, Building,
  HelpCircle, FileText, LogOut, ChevronRight, Sun, Moon
} from 'lucide-react-native';

export default function MoreScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const colors = useColors();
  const { themeMode, setThemeMode } = useThemeStore();

  const menuItems = [
    { icon: Calendar, title: 'My Bookings', route: '/bookings', color: colors.primary },
    { icon: Bell, title: 'Notifications', route: '/notifications', color: colors.accent },
    { icon: Gift, title: 'Rewards', route: '/rewards', color: colors.success },
    { icon: Users, title: 'Refer a Friend', route: '/refer', color: colors.primary },
    { icon: Building, title: 'Become a Partner', route: '/(auth)/signup?type=restaurant_owner', color: colors.secondary },
    { icon: HelpCircle, title: 'Help & Support', route: '/help', color: colors.primary },
    { icon: FileText, title: 'Terms & Privacy', route: '/terms', color: colors.textSecondary },
  ];

  const handleMenuPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/' as any);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                {themeMode === 'dark' ? (
                  <Moon size={20} color={colors.primary} />
                ) : (
                  <Sun size={20} color={colors.primary} />
                )}
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  {themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'System'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => handleMenuPress(item.route)}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                    <Icon size={20} color={item.color} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color={colors.textLight} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error + '15' }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: { borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  menuSubtitle: { fontSize: 13 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  signOutText: { fontSize: 16, fontWeight: '700' },
});