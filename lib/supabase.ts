import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============= TYPES =============
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          user_type: 'customer' | 'restaurant_owner';
          points: number;
          avatar_url: string | null;
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      restaurants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          cuisine_type: string | null;
          address: string | null;
          city: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          images: string[];
          rating: number;
          review_count: number;
          opening_hours: Record<string, any> | null;
          is_verified: boolean;
          is_active: boolean;
          accepts_reservations: boolean;
          booking_terms: string | null;
          categories: string[];
          subscription_status: 'active' | 'pending' | 'expired' | 'cancelled';
          subscription_expires: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'rating' | 'review_count'>;
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      offers: {
        Row: {
          id: string;
          restaurant_id: string;
          title: string;
          description: string | null;
          discount_percentage: number;
          offer_type: 'dine_in' | 'pickup' | 'both';
          min_order_amount: number | null;
          max_coupons: number;
          coupons_claimed: number;
          valid_from: string | null;
          valid_until: string;
          days_available: string[];
          time_slot_start: string | null;
          time_slot_end: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['offers']['Row'], 'id' | 'created_at' | 'coupons_claimed'>;
        Update: Partial<Database['public']['Tables']['offers']['Insert']>;
      };
      coupons: {
        Row: {
          id: string;
          offer_id: string;
          restaurant_id: string;
          user_id: string;
          coupon_code: string;
          qr_code_data: string | null;
          status: 'active' | 'used' | 'expired' | 'cancelled';
          claimed_at: string;
          used_at: string | null;
          expires_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'claimed_at'>;
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      bookings: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          booking_date: string;
          booking_time: string;
          guests: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          special_requests: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      inventory_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          quantity: number;
          unit: string;
          low_stock_threshold: number;
          category: string | null;
          last_updated: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'last_updated'>;
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>;
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          category: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          is_vegetarian: boolean;
          is_vegan: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'offer' | 'booking' | 'general' | 'low_stock';
          restaurant_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}

// ============= AUTH HELPERS =============
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, userData: {
  full_name: string;
  phone: string;
  address: string;
  user_type: 'customer' | 'restaurant_owner';
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  
  if (data.user && !error) {
    // Create user profile
    await supabase.from('user_profiles').insert({
      id: data.user.id,
      email: data.user.email!,
      ...userData,
      points: 0,
    });
  }
  
  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// ============= USER PROFILE =============
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Database['public']['Tables']['user_profiles']['Update']) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============= RESTAURANTS =============
export const getRestaurants = async (filters?: {
  cuisineType?: string;
  category?: string;
  city?: string;
  search?: string;
}) => {
  let query = supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });
  
  if (filters?.cuisineType) {
    query = query.eq('cuisine_type', filters.cuisineType);
  }
  
  if (filters?.category) {
    query = query.contains('categories', [filters.category]);
  }
  
  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getRestaurantById = async (id: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getMyRestaurant = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRestaurant = async (id: string, updates: Database['public']['Tables']['restaurants']['Update']) => {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============= OFFERS =============
export const getActiveOffers = async (restaurantId?: string) => {
  let query = supabase
    .from('offers')
    .select(`
      *,
      restaurants (
        id,
        name,
        logo_url,
        cuisine_type
      )
    `)
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .order('discount_percentage', { ascending: false });
  
  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createOffer = async (offer: Database['public']['Tables']['offers']['Insert']) => {
  const { data, error } = await supabase
    .from('offers')
    .insert({ ...offer, coupons_claimed: 0 })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateOffer = async (id: string, updates: Database['public']['Tables']['offers']['Update']) => {
  const { data, error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteOffer = async (id: string) => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============= COUPONS =============
export const claimCoupon = async (offerId: string, userId: string) => {
  // Generate unique coupon code
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  const couponCode = `FD-${timestamp}-${random}`;
  
  // Get offer details
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('*, restaurants(name)')
    .eq('id', offerId)
    .single();
  
  if (offerError) throw offerError;
  
  // Check if already claimed
  const { data: existing } = await supabase
    .from('coupons')
    .select('id')
    .eq('offer_id', offerId)
    .eq('user_id', userId)
    .single();
  
  if (existing) {
    throw new Error('You have already claimed this offer');
  }
  
  // Check if max coupons reached
  if (offer.coupons_claimed >= offer.max_coupons) {
    throw new Error('This offer has reached maximum claims');
  }
  
  // Create QR code data
  const qrData = JSON.stringify({
    code: couponCode,
    restaurant: offer.restaurants.name,
    discount: offer.discount_percentage,
    type: offer.offer_type,
  });
  
  // Create coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      offer_id: offerId,
      restaurant_id: offer.restaurant_id,
      user_id: userId,
      coupon_code: couponCode,
      qr_code_data: qrData,
      status: 'active',
      expires_at: offer.valid_until,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update offer claimed count
  await supabase
    .from('offers')
    .update({ coupons_claimed: offer.coupons_claimed + 1 })
    .eq('id', offerId);
  
  // Award loyalty points (discount / 2)
  const pointsToAdd = Math.round(offer.discount_percentage / 2);
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('points')
    .eq('id', userId)
    .single();
  
  if (profile) {
    await supabase
      .from('user_profiles')
      .update({ points: (profile.points || 0) + pointsToAdd })
      .eq('id', userId);
  }
  
  return coupon;
};

export const cancelCoupon = async (couponId: string, userId: string) => {
  // Get coupon details
  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .select('*, offers(coupons_claimed)')
    .eq('id', couponId)
    .eq('user_id', userId)
    .single();
  
  if (couponError) throw couponError;
  
  if (coupon.status !== 'active') {
    throw new Error('Only active coupons can be cancelled');
  }
  
  // Update coupon status
  const { data, error } = await supabase
    .from('coupons')
    .update({ status: 'cancelled' })
    .eq('id', couponId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Decrement offer claimed count
  if (coupon.offers) {
    await supabase
      .from('offers')
      .update({ coupons_claimed: Math.max(0, coupon.offers.coupons_claimed - 1) })
      .eq('id', coupon.offer_id);
  }
  
  return data;
};

export const getMyCoupons = async (userId: string, status?: 'active' | 'used' | 'expired' | 'cancelled') => {
  let query = supabase
    .from('coupons')
    .select(`
      *,
      offers (
        title,
        description,
        discount_percentage,
        offer_type
      ),
      restaurants (
        name,
        logo_url
      )
    `)
    .eq('user_id', userId)
    .order('claimed_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const useCoupon = async (couponId: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ 
      status: 'used',
      used_at: new Date().toISOString(),
    })
    .eq('id', couponId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============= FAVORITES =============
export const toggleFavorite = async (userId: string, restaurantId: string) => {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .single();
  
  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    
    if (error) throw error;
    return { isFavorite: false };
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, restaurant_id: restaurantId });
    
    if (error) throw error;
    return { isFavorite: true };
  }
};

export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      restaurants (*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

export const isFavorite = async (userId: string, restaurantId: string) => {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .single();
  
  return !!data;
};

// ============= BOOKINGS =============
export const createBooking = async (booking: Database['public']['Tables']['bookings']['Insert']) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getMyBookings = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      restaurants (
        name,
        logo_url,
        address
      )
    `)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getRestaurantBookings = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      user_profiles (
        full_name,
        phone
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('booking_date', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============= INVENTORY =============
export const getInventory = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const addInventoryItem = async (item: Database['public']['Tables']['inventory_items']['Insert']) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(item)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInventoryItem = async (id: string, updates: Database['public']['Tables']['inventory_items']['Update']) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ ...updates, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteInventoryItem = async (id: string) => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============= MENU ITEMS =============
export const getMenuItems = async (restaurantId: string, category?: string) => {
  let query = supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('category', { ascending: true });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const addMenuItem = async (item: Database['public']['Tables']['menu_items']['Insert']) => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateMenuItem = async (id: string, updates: Database['public']['Tables']['menu_items']['Update']) => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteMenuItem = async (id: string) => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============= REVIEWS =============
export const getRestaurantReviews = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user_profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addReview = async (review: Database['public']['Tables']['reviews']['Insert']) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update restaurant rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('restaurant_id', review.restaurant_id);
  
  if (reviews) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from('restaurants')
      .update({ 
        rating: Number(avgRating.toFixed(1)),
        review_count: reviews.length,
      })
      .eq('id', review.restaurant_id);
  }
  
  return data;
};

// ============= NOTIFICATIONS =============
export const getMyNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  
  if (error) throw error;
};

export const createNotification = async (notification: Database['public']['Tables']['notifications']['Insert']) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};