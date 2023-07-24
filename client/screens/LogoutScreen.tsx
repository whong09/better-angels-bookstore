import * as SecureStorage from 'expo-secure-store';
import React, { useContext, useEffect } from 'react';
import { View } from 'react-native';
import AuthContext from '../contexts/AuthContext';

const LogoutScreen = () => {
  const logoutContext = useContext(AuthContext);
  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStorage.deleteItemAsync('token');
      logoutContext();
    } catch (error) {
      console.error('Error logging out:', error);
      logoutContext();
    }
  };

  return <View />;
};

export default LogoutScreen;
