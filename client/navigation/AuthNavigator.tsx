import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CreateCustomerAccountScreen from '../screens/CreateCustomerAccountScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateCustomerAccount"
        component={CreateCustomerAccountScreen}
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
