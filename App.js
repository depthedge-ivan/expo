import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import Cart from './screens/Cart';
import AdminScreen from './screens/AdminScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Cart" 
          component={Cart}
          options={{ title: 'Shopping Cart' }}
        />
        <Stack.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ title: 'Admin Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
