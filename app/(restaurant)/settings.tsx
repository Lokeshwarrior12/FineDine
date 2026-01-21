import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useColors, getShadowStyle } from '@/constants/themes';
import { getMyRestaurant, updateRestaurant } from '@/lib/supabase';
import { Camera, Save, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CUISINES = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'American', 'Thai', 'Mediterranean'];
const CATEGORIES = [
  'Events & Experience',
  'Pubs and Bars',
  'Buffets',
  'Luxury Dining',
  'Cafes',
  'Budget Friendly',
  'Family Friendly',
  'Rooftop & Outdoors',
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const colors = useColors();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch restaurant
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['my-restaurant'],
    queryFn: () => getMyRestaurant(user!.id),
  });

  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    cuisine_type: restaurant?.cuisine_type || '',
    address: restaurant?.address || '',
    city: restaurant?.city || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || '',
    opening_hours: restaurant?.opening_hours || '',
    categories: restaurant?.categories || [],
    accepts_reservations: restaurant?.accepts_reservations ?? true,
    booking_terms: restaurant?.booking_terms || '',
    logo_url: restaurant?.logo_url || '',
  });

  React.useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        description: restaurant.description || '',
        cuisine_type: restaurant.cuisine_type || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        opening_hours: restaurant.opening_hours || '',
        categories: restaurant.categories || [],
        accepts_reservations: restaurant.accepts_reservations ?? true,
        booking_terms: restaurant.booking_terms || '',
        logo_url: restaurant.logo_url || '',
      });
    }
  }, [restaurant]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Restaurant name is required');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await updateRestaurant(restaurant!.id, {
        name: formData.name,
        description: formData.description,
        cuisine_type: formData.cuisine_type,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        opening_hours: formData.opening_hours,
        categories: formData.categories,
        accepts_reservations: formData.accepts_reservations,
        booking_terms: formData.booking_terms,
        logo_url: formData.logo_url,
      });

      queryClient.invalidateQueries({ queryKey: ['my-restaurant'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingLogo(true);
        // In production, upload to Supabase storage
        setFormData({ ...formData, logo_url: result.assets[0].uri });
        setUploadingLogo(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload logo');
    }
  };

  const toggleCategory = (category: string) => {
    const cats = formData.categories;
    if (cats.includes(category)) {
      setFormData({ ...formData, categories: cats.filter((c: string) => c !== category) });
    } else {
      setFormData({ ...formData, categories: [...cats, category] });
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Restaurant Settings</Text>
        </View>

        {/* Logo */}
        <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Restaurant Logo</Text>
          <TouchableOpacity style={styles.logoContainer} onPress={pickLogo}>
            {formData.logo_url ? (
              <Image source={{ uri: formData.logo_url }} style={styles.logo} />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceAlt }]}>
                <Camera size={32} color={colors.textLight} />
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Restaurant Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your Restaurant Name"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Tell customers about your restaurant..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Cuisine Type</Text>
            <View style={styles.chipsContainer}>
              {CUISINES.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    formData.cuisine_type === cuisine && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, cuisine_type: cuisine })}
                >
                  <Text style={[
                    styles.chipText,
                    { color: colors.text },
                    formData.cuisine_type === cuisine && { color: '#FFFFFF' },
                  ]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Location & Contact */}
        <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Contact</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Street address"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="City"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="restaurant@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Restaurant Categories</Text>
          <View style={styles.chipsContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  formData.categories.includes(category) && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.chipText,
                  { color: colors.text },
                  formData.categories.includes(category) && { color: '#FFFFFF' },
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Booking Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Table Booking</Text>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: colors.text }]}>Accept Table Reservations</Text>
            <Switch
              value={formData.accepts_reservations}
              onValueChange={(value) => setFormData({ ...formData, accepts_reservations: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {formData.accepts_reservations && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Booking Terms</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                value={formData.booking_terms}
                onChangeText={(text) => setFormData({ ...formData, booking_terms: text })}
                placeholder="e.g., Cancellation 24h before..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={[colors.gradient.start, colors.gradient.end]}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

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
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  section: { margin: 20, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  logoContainer: { alignSelf: 'center', position: 'relative' },
  logo: { width: 120, height: 120, borderRadius: 60 },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: { marginHorizontal: 20, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutText: { fontSize: 16, fontWeight: '700' },
});