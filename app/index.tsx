import { getFcmToken, requestUserPermission } from '@/firebase'; // adjust path
import { useEffect } from 'react';

useEffect(() => {
  const initNotifications = async () => {
    const hasPermission = await requestUserPermission();
    if (hasPermission) {
      const token = await getFcmToken();
      if (token) {
        // Save token to Supabase user profile or your backend
        console.log('Ready to send notifications to this device!');
      }
    }
  };

  initNotifications();
}, []);