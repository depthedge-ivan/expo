import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import Cart from './screens/Cart';
import AdminScreen from './screens/AdminScreen';

// Define the types for our navigation parameters
export type RootStackParamList = {
  Login: undefined;
  Cart: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
};

export default App;
