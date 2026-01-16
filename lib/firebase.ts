import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const FCM_TOKEN_KEY = '@fcm_token';

// Request notification permissions
export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get FCM token
export const getFCMToken = async () => {
  try {
    // Check if permission is granted
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission');
      return null;
    }

    // Get token
    const token = await messaging().getToken();
    
    if (token) {
      console.log('FCM Token:', token);
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      
      // Save token to user profile in Supabase
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await supabase
          .from('user_profiles')
          .update({ fcm_token: token })
          .eq('id', user.data.user.id);
      }
      
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Setup notification listeners
export const setupNotificationListeners = () => {
  // Foreground message handler
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification:', remoteMessage);
    
    // You can show a local notification here using expo-notifications
    // or handle it in your app state
  });

  // Background message handler (must be outside component)
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background notification:', remoteMessage);
  });

  // Notification opened app from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
      }
    });

  // Notification opened app from background state
  const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification caused app to open from background state:', remoteMessage);
  });

  // Token refresh listener
  const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (token) => {
    console.log('FCM token refreshed:', token);
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    
    // Update token in Supabase
    const user = await supabase.auth.getUser();
    if (user.data.user) {
      await supabase
        .from('user_profiles')
        .update({ fcm_token: token })
        .eq('id', user.data.user.id);
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpenedApp();
    unsubscribeOnTokenRefresh();
  };
};

// Subscribe to topic (e.g., 'new_offers')
export const subscribeToTopic = async (topic: string) => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error('Error subscribing to topic:', error);
  }
};

// Unsubscribe from topic
export const unsubscribeFromTopic = async (topic: string) => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
  }
};

// Initialize Firebase Cloud Messaging
export const initializeFirebaseMessaging = async () => {
  try {
    // Request permission and get token
    await getFCMToken();
    
    // Setup listeners
    const cleanup = setupNotificationListeners();
    
    return cleanup;
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
  }
};