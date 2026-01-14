import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Text, View } from 'react-native';

export default function Profile() {
  const { session, user, isLoading } = useAuth();

  if (isLoading) return <Text>Loading auth...</Text>;

  if (!session) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
      <Button
        title="Sign Out"
        onPress={() => supabase.auth.signOut()}
      />
    </View>
  );
}