import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColors, getShadowStyle } from '@/constants/theme';
import { getMyRestaurant, getActiveOffers, getMyCoupons } from '@/lib/supabase';
import { 
  Plus, Tag, TrendingUp, Users, Heart, BarChart3, 
  Settings, Eye, Clock, CheckCircle 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RestaurantDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const colors = useColors();

  // Fetch restaurant data
  const { data: restaurant, isLoading: loadingRestaurant, refetch } = useQuery({
    queryKey: ['my-restaurant'],
    queryFn: () => getMyRestaurant(user!.id),
    enabled: !!user,
  });

  // Fetch offers
  const { data: offers } = useQuery({
    queryKey: ['restaurant-offers', restaurant?.id],
    queryFn: () => getActiveOffers(restaurant?.id),
    enabled: !!restaurant?.id,
  });

  // Calculate stats
  const activeOffers = offers?.filter((o: any) => o.is_active)?.length || 0;
  const totalClaimed = offers?.reduce((sum: number, o: any) => sum + o.coupons_claimed, 0) || 0;

  const stats = [
    { 
      icon: Tag, 
      label: 'Active Offers', 
      value: activeOffers, 
      color: colors.primary,
      bgColor: colors.primary + '15',
    },
    { 
      icon: TrendingUp, 
      label: 'Coupons Today', 
      value: 0, 
      color: colors.success,
      bgColor: colors.success + '15',
    },
    { 
      icon: Users, 
      label: 'Total Claimed', 
      value: totalClaimed, 
      color: colors.accent,
      bgColor: colors.accent + '15',
    },
    { 
      icon: Heart, 
      label: 'Favorites', 
      value: 0, 
      color: colors.error,
      bgColor: colors.error + '15',
    },
  ];

  const quickActions = [
    { 
      icon: Plus, 
      label: 'New Offer', 
      route: '/(restaurant)/offers',
      color: colors.primary,
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      route: '/(restaurant)/analytics',
      color: colors.accent,
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      route: '/(restaurant)/settings',
      color: colors.secondary,
    },
    { 
      icon: Eye, 
      label: 'View Page', 
      route: `/restaurant/${restaurant?.id}`,
      color: colors.success,
    },
  ];

  const handleActionPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as any);
  };

  const handleCreateOffer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(restaurant)/offers' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingRestaurant} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.secondary, colors.secondary + 'CC']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.restaurantName}>{restaurant?.name || 'Restaurant Owner'}</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateOffer}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View
                key={index}
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card },
                  getShadowStyle(false),
                ]}
              >
                <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionCard,
                    { backgroundColor: colors.card },
                    getShadowStyle(false),
                  ]}
                  onPress={() => handleActionPress(action.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                    <Icon size={24} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Active Offers */}
        {offers && offers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Offers</Text>
              <TouchableOpacity onPress={() => router.push('/(restaurant)/offers' as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>

            {offers.slice(0, 3).map((offer: any) => (
              <View
                key={offer.id}
                style={[
                  styles.offerCard,
                  { backgroundColor: colors.card },
                  getShadowStyle(false),
                ]}
              >
                {/* Discount Badge */}
                <View style={[styles.offerBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{offer.discount_percentage}%</Text>
                </View>

                <View style={styles.offerContent}>
                  <Text style={[styles.offerTitle, { color: colors.text }]} numberOfLines={1}>
                    {offer.title}
                  </Text>
                  
                  <View style={styles.offerMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: colors.surfaceAlt }]}>
                      <Text style={[styles.typeText, { color: colors.text }]}>
                        {offer.offer_type === 'dine_in' ? 'Dine-in' : 
                         offer.offer_type === 'pickup' ? 'Pickup' : 'Both'}
                      </Text>
                    </View>
                    
                    <View style={styles.offerStats}>
                      <Clock size={14} color={colors.textLight} />
                      <Text style={[styles.offerExpiry, { color: colors.textLight }]}>
                        Expires {new Date(offer.valid_until).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
                      <View
                        style={[
                          styles.progressBar,
                          { 
                            backgroundColor: colors.primary,
                            width: `${(offer.coupons_claimed / offer.max_coupons) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                      {offer.coupons_claimed}/{offer.max_coupons} claimed
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          
          <View style={[styles.activityCard, { backgroundColor: colors.card }, getShadowStyle(false)]}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: colors.success }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  New coupon claimed
                </Text>
                <Text style={[styles.activityTime, { color: colors.textLight }]}>2 minutes ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  New review received
                </Text>
                <Text style={[styles.activityTime, { color: colors.textLight }]}>1 hour ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: colors.accent }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  Table booking confirmed
                </Text>
                <Text style={[styles.activityTime, { color: colors.textLight }]}>3 hours ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  offerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  offerBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offerExpiry: {
    fontSize: 12,
  },
  progressContainer: {
    gap: 6,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  activityCard: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
});