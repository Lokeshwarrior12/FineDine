import { getThemedStyles, useTheme } from '@/contexts/ThemeContext';
import { getActiveOffers, getCurrentUser, getRestaurants, getUserProfile } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Clock,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface UserProfile {
  id: string;
  full_name: string;
  points: number;
  avatar_url?: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  rating: number;
  cover_image_url: string;
  address: string;
  logo_url: string;
}

interface Offer {
  id: string;
  title: string;
  discount_percentage: number;
  valid_until: string;
  restaurants: {
    name: string;
    logo_url: string;
  };
}

const cuisineTypes = [
  { id: '1', name: 'All', icon: '🍽️' },
  { id: '2', name: 'Italian', icon: '🍝' },
  { id: '3', name: 'Japanese', icon: '🍱' },
  { id: '4', name: 'Mexican', icon: '🌮' },
  { id: '5', name: 'Indian', icon: '🍛' },
  { id: '6', name: 'Chinese', icon: '🥡' },
  { id: '7', name: 'American', icon: '🍔' },
  { id: '8', name: 'Thai', icon: '🍜' },
];

export default function CustomerHome() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [hotDeals, setHotDeals] = useState<Offer[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile as UserProfile);
      }

      const [offers, restaurants] = await Promise.all([
        getActiveOffers(),
        getRestaurants(),
      ]);

      setHotDeals(offers as any[] || []);
      setNearbyRestaurants(restaurants as Restaurant[] || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCuisineSelect = (cuisine: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCuisine(cuisine);
  };

  const handleSearch = () => {
    router.push({
      pathname: '/(customer)/deals',
      params: { search: searchQuery },
    });
  };

  const handleDealPress = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/restaurant/${offerId}`);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.gradient.start, colors.gradient.end]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header Content */}
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: userProfile?.avatar_url || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{userProfile?.full_name || 'Guest'}</Text>
            </View>
          </View>

          {/* Points Badge */}
          <TouchableOpacity style={styles.pointsBadge}>
            <Sparkles size={18} color="#FFD700" />
            <Text style={styles.pointsText}>{userProfile?.points || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderCuisineChips = () => (
    <View style={styles.section}>
      <FlatList
        data={cuisineTypes}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCuisine === item.name && styles.chipActive,
            ]}
            onPress={() => handleCuisineSelect(item.name)}
          >
            <Text style={styles.chipEmoji}>{item.icon}</Text>
            <Text
              style={[
                styles.chipText,
                selectedCuisine === item.name && styles.chipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderHotDeals = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Hot Deals</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(customer)/deals')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={hotDeals}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dealsContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dealCard}
            onPress={() => handleDealPress(item.id)}
            activeOpacity={0.9}
          >
            <View style={styles.dealImageContainer}>
              <Image
                source={{ uri: item.restaurants.logo_url || 'https://via.placeholder.com/300' }}
                style={styles.dealImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.dealOverlay}
              />
              
              {/* Discount Badge */}
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount_percentage}%</Text>
                <Text style={styles.discountLabel}>OFF</Text>
              </View>
            </View>

            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {item.restaurants.name}
              </Text>
              <View style={styles.dealFooter}>
                <Clock size={14} color={colors.textLight} />
                <Text style={styles.dealExpiry}>
                  Expires {new Date(item.valid_until).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderNearbyRestaurants = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MapPin size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
        </View>
      </View>

      {nearbyRestaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.id}
          style={styles.restaurantCard}
          onPress={() => router.push(`/restaurant/${restaurant.id}`)}
        >
          <Image
            source={{ uri: restaurant.cover_image_url || 'https://via.placeholder.com/100' }}
            style={styles.restaurantImage}
          />
          
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
            
            <View style={styles.restaurantMeta}>
              <View style={styles.rating}>
                <Star size={16} color="#FFB703" fill="#FFB703" />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
              <Text style={styles.address} numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.favoriteButton}>
            <Heart size={20} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {renderHeader()}
        {renderCuisineChips()}
        {renderHotDeals()}
        {renderNearbyRestaurants()}
        
        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => {
  const themedStyles = getThemedStyles(isDark);
  
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingBottom: 24,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    headerContent: {
      gap: 16,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    greeting: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    pointsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    pointsText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 16,
      paddingHorizontal: 16,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 50,
      color: '#FFFFFF',
      fontSize: 16,
    },
    section: {
      marginTop: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    seeAll: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    chipsContainer: {
      paddingHorizontal: 20,
      gap: 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipEmoji: {
      fontSize: 18,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
    dealsContainer: {
      paddingLeft: 20,
      paddingRight: 10,
      gap: 16,
    },
    dealCard: {
      width: CARD_WIDTH,
      borderRadius: 20,
      backgroundColor: colors.card,
      overflow: 'hidden',
      ...themedStyles.shadow,
    },
    dealImageContainer: {
      width: '100%',
      height: 180,
      position: 'relative',
    },
    dealImage: {
      width: '100%',
      height: '100%',
    },
    dealOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    discountBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
    },
    discountText: {
      fontSize: 24,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    discountLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    dealInfo: {
      padding: 16,
    },
    dealTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    restaurantName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    dealFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dealExpiry: {
      fontSize: 12,
      color: colors.textLight,
    },
    restaurantCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 12,
      ...themedStyles.shadow,
    },
    restaurantImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    restaurantInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
    },
    restaurantMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    ratingText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    cuisineType: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    address: {
      flex: 1,
      fontSize: 12,
      color: colors.textLight,
    },
    favoriteButton: {
      padding: 8,
      alignSelf: 'flex-start',
    },
  });
};