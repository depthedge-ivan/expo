import React from 'react';
import { View, Text, Button } from 'react-native';

export default function UserScreen({ supabase }) {
  return (
    <View>
      <Text>Welcome, User!</Text>
      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
