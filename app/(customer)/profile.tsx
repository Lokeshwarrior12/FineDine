import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColors, getShadowStyle } from '@/constants/theme';
import { getFavorites, updateUserProfile } from '@/lib/supabase';
import { 
  User, Mail, Phone, MapPin, Heart, Star, 
  Award, Camera, ChevronRight 
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const colors = useColors();
  const queryClient = useQueryClient();

  const [uploading, setUploading] = useState(false);

  // Fetch favorites
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites(user!.id),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateUserProfile(user!.id, data),
    onSuccess: () => {
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // In production, upload to Supabase storage
        // For now, just update with URI
        await updateProfileMutation.mutateAsync({
          avatar_url: result.assets[0].uri,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.end]}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + profile?.full_name 
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary }]}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }, getShadowStyle(false)]}>
            <Award size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{profile?.points || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Points</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }, getShadowStyle(false)]}>
            <Heart size={24} color={colors.error} />
            <Text style={[styles.statValue, { color: colors.text }]}>{favorites?.length || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Favorites</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }, getShadowStyle(false)]}>
            <Star size={24} color={colors.rating} />
            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reviews</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

          <View style={styles.infoRow}>
            <User size={20} color={colors.textLight} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.full_name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={20} color={colors.textLight} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color={colors.textLight} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color={colors.textLight} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{profile?.address}</Text>
            </View>
          </View>
        </View>

        {/* Favorite Restaurants */}
        {favorites && favorites.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }, getShadowStyle(false)]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Restaurants</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {favorites.slice(0, 3).map((fav: any) => (
              <TouchableOpacity key={fav.id} style={styles.favItem}>
                <Image
                  source={{ uri: fav.restaurants?.cover_image_url || 'https://via.placeholder.com/60' }}
                  style={styles.favImage}
                />
                <View style={styles.favInfo}>
                  <Text style={[styles.favName, { color: colors.text }]}>{fav.restaurants?.name}</Text>
                  <Text style={[styles.favCuisine, { color: colors.textSecondary }]}>
                    {fav.restaurants?.cuisine_type}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  email: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '700', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '500' },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  favImage: { width: 60, height: 60, borderRadius: 12 },
  favInfo: { flex: 1 },
  favName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  favCuisine: { fontSize: 14 },
});