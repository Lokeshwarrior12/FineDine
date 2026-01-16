import { getShadowStyle, useColors } from '@/constants/theme';
import { getActiveOffers } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Clock, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Filters {
  cuisineType: string;
  offerType: string;
  minDiscount: number;
}

export default function DealsScreen() {
  const router = useRouter();
  const colors = useColors();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    cuisineType: 'all',
    offerType: 'all',
    minDiscount: 0,
  });

  // Fetch offers
  const { data: offers, isLoading, refetch } = useQuery({
    queryKey: ['active-offers'],
    queryFn: () => getActiveOffers(),
  });

  // Filter offers based on search and filters
  const filteredOffers = offers?.filter((offer: any) => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.restaurants?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCuisine = 
      filters.cuisineType === 'all' || 
      offer.restaurants?.cuisine_type === filters.cuisineType;

    const matchesType = 
      filters.offerType === 'all' || 
      offer.offer_type === filters.offerType;

    const matchesDiscount = offer.discount_percentage >= filters.minDiscount;

    return matchesSearch && matchesCuisine && matchesType && matchesDiscount;
  }) || [];

  const handleDealPress = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/restaurant/${offerId}` as any);
  };

  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilters({
      cuisineType: 'all',
      offerType: 'all',
      minDiscount: 0,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderDealCard = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.dealCard, { backgroundColor: colors.card }, getShadowStyle(false)]}
      onPress={() => handleDealPress(item.id)}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.restaurants?.logo_url || 'https://via.placeholder.com/200' }}
          style={styles.dealImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        
        {/* Discount Badge */}
        <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.discountText}>{item.discount_percentage}%</Text>
          <Text style={styles.discountLabel}>OFF</Text>
        </View>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.typeBadgeText, { color: colors.text }]}>
            {item.offer_type === 'dine_in' ? '🍽️ Dine-in' : 
             item.offer_type === 'pickup' ? '🥡 Pickup' : '🍽️🥡 Both'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.dealTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={[styles.restaurantName, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.restaurants?.name}
        </Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerRow}>
            <Clock size={14} color={colors.textLight} />
            <Text style={[styles.footerText, { color: colors.textLight }]}>
              Expires {new Date(item.valid_until).toLocaleDateString()}
            </Text>
          </View>

          {item.coupons_claimed < item.max_coupons ? (
            <View style={[styles.availableBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.availableText, { color: colors.success }]}>
                {item.max_coupons - item.coupons_claimed} left
              </Text>
            </View>
          ) : (
            <View style={[styles.availableBadge, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.availableText, { color: colors.error }]}>
                Sold out
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    const cuisineTypes = ['all', 'Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'American'];
    const offerTypes = ['all', 'dine_in', 'pickup', 'both'];
    const discountRanges = [
      { label: 'All', value: 0 },
      { label: '30%+', value: 30 },
      { label: '40%+', value: 40 },
      { label: '50%', value: 50 },
    ];

    return (
      <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
        {/* Cuisine Type */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Cuisine Type</Text>
          <View style={styles.filterChips}>
            {cuisineTypes.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border },
                  filters.cuisineType === cuisine && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setFilters({ ...filters, cuisineType: cuisine })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.text },
                    filters.cuisineType === cuisine && { color: '#FFFFFF' },
                  ]}
                >
                  {cuisine === 'all' ? 'All' : cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Offer Type */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Offer Type</Text>
          <View style={styles.filterChips}>
            {offerTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border },
                  filters.offerType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setFilters({ ...filters, offerType: type })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.text },
                    filters.offerType === type && { color: '#FFFFFF' },
                  ]}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Discount Range */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Minimum Discount</Text>
          <View style={styles.filterChips}>
            {discountRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border },
                  filters.minDiscount === range.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setFilters({ ...filters, minDiscount: range.value })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.text },
                    filters.minDiscount === range.value && { color: '#FFFFFF' },
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Clear Filters */}
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: colors.border }]}
          onPress={clearFilters}
        >
          <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Deals</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search restaurants or deals..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: showFilters ? colors.primary : colors.surfaceAlt }]}
          onPress={toggleFilters}
        >
          <SlidersHorizontal size={20} color={showFilters ? '#FFFFFF' : colors.text} />
          <Text style={[styles.filterButtonText, { color: showFilters ? '#FFFFFF' : colors.text }]}>
            Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {renderFilters()}

      {/* Deals Grid */}
      <FlatList
        data={filteredOffers}
        renderItem={renderDealCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isLoading ? 'Loading deals...' : 'No deals found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dealCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  discountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  discountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 13,
    marginBottom: 8,
  },
  cardFooter: {
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
  },
  availableBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});