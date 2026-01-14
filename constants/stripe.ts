import Constants from 'expo-constants';

export const stripeConfig = {
  publishableKey: Constants.expoConfig?.extra?.stripePublishableKey || 'pk_test_51AE06Az123DemoKeyReplaceMe',
};