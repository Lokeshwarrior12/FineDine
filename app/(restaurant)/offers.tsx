import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColors, getShadowStyle } from '@/constants/theme';
import { 
  getMyRestaurant, 
  getActiveOffers, 
  createOffer, 
  updateOffer,
  deleteOffer 
} from '@/lib/supabase';
import { Plus, Edit3, Trash2, X, Tag, Clock, TrendingUp } from 'lucide-react-native';

const OFFER_TYPES = ['dine_in', 'pickup', 'both'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function OffersScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percentage: '30',
    offer_type: 'both' as 'dine_in' | 'pickup' | 'both',
    min_order_amount: '0',
    max_coupons: '50',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days_available: [] as string[],
    time_slot_start: '12:00',
    time_slot_end: '20:00',
    is_active: true,
  });

  // Fetch restaurant
  const { data: restaurant } = useQuery({
    queryKey: ['my-restaurant'],
    queryFn: () => getMyRestaurant(user!.id),
  });

  // Fetch offers
  const { data: offers, isLoading, refetch } = useQuery({
    queryKey: ['restaurant-offers', restaurant?.id],
    queryFn: () => getActiveOffers(restaurant?.id),
    enabled: !!restaurant?.id,
  });

  // Create/Update offer mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingOffer) {
        return await updateOffer(editingOffer.id, data);
      } else {
        return await createOffer({ ...data, restaurant_id: restaurant!.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-offers'] });
      setShowModal(false);
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', editingOffer ? 'Offer updated' : 'Offer created');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  // Delete offer mutation
  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-offers'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const resetForm = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discount_percentage: '30',
      offer_type: 'both',
      min_order_amount: '0',
      max_coupons: '50',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      days_available: [],
      time_slot_start: '12:00',
      time_slot_end: '20:00',
      is_active: true,
    });
  };

  const handleCreateNew = () => {
    resetForm();
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      discount_percentage: offer.discount_percentage.toString(),
      offer_type: offer.offer_type,
      min_order_amount: offer.min_order_amount?.toString() || '0',
      max_coupons: offer.max_coupons.toString(),
      valid_until: offer.valid_until.split('T')[0],
      days_available: offer.days_available || [],
      time_slot_start: offer.time_slot_start || '12:00',
      time_slot_end: offer.time_slot_end || '20:00',
      is_active: offer.is_active,
    });
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = (offerId: string) => {
    Alert.alert(
      'Delete Offer',
      'Are you sure you want to delete this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(offerId),
        },
      ]
    );
  };

  const validateAndSave = () => {
    const discount = parseInt(formData.discount_percentage);
    
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter offer title');
      return;
    }

    if (discount < 30 || discount > 50) {
      Alert.alert('Error', 'Discount must be between 30% and 50%');
      return;
    }

    const maxCoupons = parseInt(formData.max_coupons);
    if (maxCoupons < 1) {
      Alert.alert('Error', 'Max coupons must be at least 1');
      return;
    }

    const offerData = {
      title: formData.title,
      description: formData.description,
      discount_percentage: discount,
      offer_type: formData.offer_type,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_coupons: maxCoupons,
      valid_until: new Date(formData.valid_until + 'T23:59:59').toISOString(),
      days_available: formData.days_available,
      time_slot_start: formData.time_slot_start,
      time_slot_end: formData.time_slot_end,
      is_active: formData.is_active,
    };

    saveMutation.mutate(offerData);
  };

  const toggleDay = (day: string) => {
    const days = formData.days_available;
    if (days.includes(day)) {
      setFormData({ ...formData, days_available: days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, days_available: [...days, day] });
    }
  };

  const renderOfferCard = ({ item }: any) => (
    <View style={[styles.offerCard, { backgroundColor: colors.card }, getShadowStyle(false)]}>
      {/* Badge */}
      <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.badgeText}>{item.discount_percentage}%</Text>
      </View>

      <View style={styles.offerContent}>
        {/* Title */}
        <Text style={[styles.offerTitle, { color: colors.text }]}>{item.title}</Text>
        
        {/* Meta */}
        <View style={styles.offerMeta}>
          <View style={[styles.typeBadge, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.typeText, { color: colors.text }]}>
              {item.offer_type === 'both' ? 'Dine-in & Pickup' : 
               item.offer_type === 'dine_in' ? 'Dine-in' : 'Pickup'}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textLight} />
            <Text style={[styles.metaText, { color: colors.textLight }]}>
              {new Date(item.valid_until).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.progressBar,
                { 
                  backgroundColor: colors.primary,
                  width: `${(item.coupons_claimed / item.max_coupons) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {item.coupons_claimed}/{item.max_coupons} claimed
          </Text>
        </View>

        {/* Status */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_active ? colors.success + '20' : colors.textLight + '20' }
        ]}>
          <Text style={[styles.statusText, { color: item.is_active ? colors.success : colors.textLight }]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleEdit(item)}
        >
          <Edit3 size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal visible={showModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingOffer ? 'Edit Offer' : 'Create New Offer'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Offer Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="e.g., Happy Hour Special"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Brief description..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Discount & Min Order */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Discount % (30-50) *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                  value={formData.discount_percentage}
                  onChangeText={(text) => setFormData({ ...formData, discount_percentage: text })}
                  keyboardType="number-pad"
                  placeholder="40"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Min Order ($)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                  value={formData.min_order_amount}
                  onChangeText={(text) => setFormData({ ...formData, min_order_amount: text })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            {/* Offer Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Offer Type *</Text>
              <View style={styles.typeButtons}>
                {OFFER_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { borderColor: colors.border },
                      formData.offer_type === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setFormData({ ...formData, offer_type: type as any })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: colors.text },
                        formData.offer_type === type && { color: '#FFFFFF' },
                      ]}
                    >
                      {type === 'both' ? 'Both' : type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Max Coupons */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Max Coupons *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                value={formData.max_coupons}
                onChangeText={(text) => setFormData({ ...formData, max_coupons: text })}
                keyboardType="number-pad"
                placeholder="50"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Valid Until */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Valid Until *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                value={formData.valid_until}
                onChangeText={(text) => setFormData({ ...formData, valid_until: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Days Available */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Days Available</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      { borderColor: colors.border },
                      formData.days_available.includes(day) && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: colors.text },
                        formData.days_available.includes(day) && { color: '#FFFFFF' },
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Active Toggle */}
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: colors.text }]}>Activate Immediately</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={validateAndSave}
              disabled={saveMutation.isPending}
            >
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                style={styles.buttonGradient}
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Offers</Text>
        <TouchableOpacity
          style={[styles.createFab, { backgroundColor: colors.primary }]}
          onPress={handleCreateNew}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Offers List */}
      <FlatList
        data={offers}
        renderItem={renderOfferCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Tag size={64} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isLoading ? 'Loading offers...' : 'No offers yet'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateNew}
            >
              <Text style={styles.emptyButtonText}>Create Your First Offer</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  createFab: {
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
  listContent: { padding: 20, paddingBottom: 100 },
  offerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  discountBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  offerContent: { flex: 1 },
  offerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  offerMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  progressSection: { marginBottom: 8 },
  progressBg: { height: 6, borderRadius: 3, marginBottom: 4 },
  progressBar: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  actions: { gap: 8, marginLeft: 8 },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: { fontSize: 16, marginTop: 16, marginBottom: 24 },
  emptyButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: { height: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalBody: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  typeButtons: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  typeButtonText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  dayText: { fontSize: 13, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  cancelButton: { justifyContent: 'center', alignItems: 'center', height: 50 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  saveButton: {},
  buttonGradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});