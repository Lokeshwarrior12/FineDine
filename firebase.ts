// firebase.ts
import messaging from '@react-native-firebase/messaging'; // ← Correct singleton import
import { PermissionsAndroid, Platform } from 'react-native';

// Request notification permission (cross-platform)
export const requestUserPermission = async (): Promise<boolean> => {
  try {
    // iOS: Use RN Firebase permission request
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('iOS Notification permission granted:', authStatus);
      } else {
        console.log('iOS Notification permission denied');
      }
      return enabled;
    }

    // Android: Explicit POST_NOTIFICATIONS permission (required API 33+)
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      const grantedStatus = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('Android Notification permission:', grantedStatus ? 'granted' : 'denied');
      return grantedStatus;
    }

    return false; // Other platforms (web, etc.)
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

// Get FCM token (call only AFTER permission is granted!)
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // Optional: Register device for remote messages (iOS only, no-op on Android)
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('FCM Token error:', error);
    return null;
  }
};

// Optional: Listen for token refresh (call once on app start)
export const setupTokenRefreshListener = () => {
  return messaging().onTokenRefresh((newToken) => {
    console.log('FCM Token refreshed:', newToken);
    // Save new token to your backend / storage here
  });
};