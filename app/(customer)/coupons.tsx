import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  Clipboard,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/contexts/AuthContext';
import { useColors, getShadowStyle } from '@/constants/themes';
import { getMyCoupons, cancelCoupon } from '@/lib/supabase';
import { Ticket, QrCode, Copy, Check, X, Clock, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TABS = [
  { key: 'active', label: 'Active', status: 'active' },
  { key: 'used', label: 'Used', status: 'used' },
  { key: 'expired', label: 'Expired', status: 'expired' },
  { key: 'cancelled', label: 'Cancelled', status: 'cancelled' },
];

export default function CouponsScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch coupons
  const { data: coupons, isLoading, refetch } = useQuery({
    queryKey: ['my-coupons', TABS[activeTab].status],
    queryFn: () => getMyCoupons(user!.id, TABS[activeTab].status as any),
  });

  // Cancel coupon mutation
  const cancelMutation = useMutation({
    mutationFn: (couponId: string) => cancelCoupon(couponId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-coupons'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Coupon cancelled successfully');
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
    },
  });

  const handleCancelCoupon = (couponId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Cancel Coupon',
      'Are you sure you want to cancel this coupon? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(couponId),
        },
      ]
    );
  };

  const handleCopyCode = (code: string, id: string) => {
    Clipboard.setString(code);
    setCopiedId(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowQR = (coupon: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCoupon(coupon);
    setShowQR(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'used':
        return colors.primary;
      case 'expired':
        return colors.textLight;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return Check;
      case 'used':
        return Ticket;
      case 'expired':
        return Clock;
      case 'cancelled':
        return X;
      default:
        return AlertCircle;
    }
  };

  const renderCouponCard = ({ item }: any) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);
    const isActive = item.status === 'active';
    const isCopied = copiedId === item.id;

    return (
      <View style={[styles.couponCard, { backgroundColor: colors.card }, getShadowStyle(false)]}>
        {/* Header */}
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.end]}
          style={styles.couponHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: item.restaurants?.logo_url || 'https://via.placeholder.com/50' }}
              style={styles.restaurantLogo}
            />
            <View style={styles.headerText}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {item.restaurants?.name}
              </Text>
              <Text style={styles.offerTitle} numberOfLines={1}>
                {item.offers?.title}
              </Text>
            </View>
          </View>

          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.offers?.discount_percentage}%</Text>
            <Text style={styles.discountLabel}>OFF</Text>
          </View>
        </LinearGradient>

        {/* Coupon Body */}
        <View style={styles.couponBody}>
          {/* Coupon Code */}
          <View style={[styles.codeContainer, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Coupon Code</Text>
            <View style={styles.codeRow}>
              <Text style={[styles.code, { color: colors.text }]}>{item.coupon_code}</Text>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: isCopied ? colors.success : colors.primary }]}
                onPress={() => handleCopyCode(item.coupon_code, item.id)}
              >
                {isCopied ? (
                  <Check size={16} color="#FFFFFF" />
                ) : (
                  <Copy size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Type:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {item.offers?.offer_type === 'dine_in' ? '🍽️ Dine-in' : 
                 item.offers?.offer_type === 'pickup' ? '🥡 Pickup' : '🍽️🥡 Both'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Expires:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {new Date(item.expires_at).toLocaleDateString()}
              </Text>
            </View>

            {item.used_at && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Used on:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {new Date(item.used_at).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <StatusIcon size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {isActive && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleShowQR(item)}
                >
                  <QrCode size={18} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Show QR Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error, borderWidth: 1, borderColor: colors.error }]}
                  onPress={() => handleCancelCoupon(item.id)}
                >
                  <X size={18} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderQRModal = () => {
    if (!selectedCoupon) return null;

    return (
      <Modal
        visible={showQR}
        animationType="fade"
        transparent
        onRequestClose={() => setShowQR(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                setShowQR(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Show this QR Code</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              at {selectedCoupon.restaurants?.name}
            </Text>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <QRCode
                value={selectedCoupon.qr_code_data || selectedCoupon.coupon_code}
                size={220}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>

            {/* Coupon Details */}
            <View style={[styles.qrDetails, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.qrCode, { color: colors.text }]}>
                {selectedCoupon.coupon_code}
              </Text>
              <Text style={[styles.qrDiscount, { color: colors.primary }]}>
                {selectedCoupon.offers?.discount_percentage}% OFF
              </Text>
            </View>

            <Text style={[styles.qrNote, { color: colors.textLight }]}>
              Valid until {new Date(selectedCoupon.expires_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Coupons</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab, index) => {
            const isActive = activeTab === index;
            const count = coupons?.length || 0;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  { borderBottomColor: colors.border },
                  isActive && { borderBottomColor: colors.primary },
                ]}
                onPress={() => {
                  setActiveTab(index);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.textSecondary },
                    isActive && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && count > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Coupons List */}
      <FlatList
        data={coupons}
        renderItem={renderCouponCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ticket size={64} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isLoading ? 'Loading coupons...' : `No ${TABS[activeTab].label.toLowerCase()} coupons`}
            </Text>
          </View>
        }
      />

      {/* QR Modal */}
      {renderQRModal()}
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
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  couponCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  restaurantLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  discountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 12,
  },
  discountText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  discountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  couponBody: {
    padding: 16,
  },
  codeContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  code: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  qrDetails: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrCode: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  qrDiscount: {
    fontSize: 24,
    fontWeight: '800',
  },
  qrNote: {
    fontSize: 12,
    textAlign: 'center',
  },
});