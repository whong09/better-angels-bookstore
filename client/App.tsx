import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { LogBox } from 'react-native';
import AuthContext from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import { PaperProvider } from 'react-native-paper';
import { CustomerContextProvider } from './contexts/CustomerContext';
import { BadgeContextProvider } from './contexts/BadgeContext';
LogBox.ignoreLogs(['Warning: ...']);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function login() {
    setIsAuthenticated(true);
  }

  function logout() {
    SecureStore.deleteItemAsync('token');
    setIsAuthenticated(false);
  }

  return (
    <PaperProvider>
      <CustomerContextProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <BadgeContextProvider>
              <AuthContext.Provider value={logout}>
                <AppNavigator />
              </AuthContext.Provider>
            </BadgeContextProvider>
          ) : (
            <AuthContext.Provider value={login}>
              <AuthNavigator />
            </AuthContext.Provider>
          )}
        </NavigationContainer>
      </CustomerContextProvider>
    </PaperProvider>
  );
};

export default App;
