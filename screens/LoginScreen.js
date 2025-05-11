import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../lib/supabaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    try {
      // Check for specific credentials
      if (email === 'admin' && password === 'admin') {
        navigation.navigate('Admin');
        setLoading(false);
        return;
      }

      if (email === 'coolivan2604@gmail.com' && password === 'Password') {
        navigation.navigate('Cart');
        setLoading(false);
        return;
      }

      // For all other credentials, proceed with normal login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
        setLoading(false);
        return;
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in.',
          [
            {
              text: 'Resend Verification',
              onPress: handleResendVerification
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
        setLoading(false);
        return;
      }

      // Get user role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        Alert.alert('Error', 'Failed to get user role');
        setLoading(false);
        return;
      }

      // Navigate based on role
      if (profileData.role === 'admin') {
        navigation.navigate('Admin');
      } else {
        navigation.navigate('Cart');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            role: isAdmin ? 'admin' : 'user'
          }
        }
      });

      if (error) {
        Alert.alert('Registration Failed', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create profile with role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              role: isAdmin ? 'admin' : 'user',
              email: email
            }
          ]);

        if (profileError) {
          Alert.alert('Error', 'Failed to create user profile');
          setLoading(false);
          return;
        }

        Alert.alert(
          'Registration Successful',
          'Please check your email for the verification link!',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsRegistering(false);
                setEmail('');
                setPassword('');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
    setLoading(false);
  }

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Verification Email Resent',
          'Please check your email for the verification link.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification email');
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        leftIcon={{ type: 'material', name: 'email' }}
        onChangeText={setEmail}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
        keyboardType="email-address"
        disabled={loading}
      />
      
      <Input
        label="Password"
        leftIcon={{ type: 'material', name: 'lock' }}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
        autoCapitalize="none"
        disabled={loading}
      />

      {isRegistering && (
        <View style={styles.adminToggle}>
          <Input
            label="Register as Admin?"
            leftIcon={{ type: 'material', name: 'admin-panel-settings' }}
            value={isAdmin ? 'Yes' : 'No'}
            disabled={true}
            rightIcon={
              <Button
                title={isAdmin ? 'Yes' : 'No'}
                type="clear"
                onPress={() => setIsAdmin(!isAdmin)}
                disabled={loading}
              />
            }
          />
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          title={isRegistering ? "Register" : "Sign In"}
          onPress={isRegistering ? signUpWithEmail : signInWithEmail}
          loading={loading}
          disabled={loading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
          type="clear"
          onPress={() => {
            setIsRegistering(!isRegistering);
            setIsAdmin(false);
          }}
          disabled={loading}
        />
      </View>

      {isRegistering && (
        <View style={styles.buttonContainer}>
          <Button
            title="Resend Verification Email"
            type="clear"
            onPress={handleResendVerification}
            disabled={loading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
  adminToggle: {
    marginBottom: 10,
  },
});
