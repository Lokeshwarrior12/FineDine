import { useAuth } from '@/context/AuthContext';
import { cancelCoupon, getMyCoupons } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

const TABS = ['Active', 'Used', 'Expired', 'Cancelled'];
const statusMap = ['active', 'used', 'expired', 'cancelled'] as const;
type TabIndex = 0 | 1 | 2 | 3;

export default function CouponsScreen() {
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['my-coupons', user?.id, statusMap[activeTab]],
    queryFn: () =>
       getMyCoupons(user!.id, statusMap[activeTab]),
    enabled: !!user,
  });


  const cancelMutation = useMutation({
    mutationFn: (couponId: string) => {
      if (!user) throw new Error('Not authenticated');
      return cancelCoupon(couponId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-coupons'],
      });
      Alert.alert('Success', 'Coupon cancelled');
    },
  });

  const handleCancel = (couponId: string) => {
    Alert.alert(
      'Cancel Coupon',
      'Are you sure? You cannot undo this.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => cancelMutation.mutate(couponId) },
      ]
    );
  };

  // render UI...
}
