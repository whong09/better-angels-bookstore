import { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api/authApi';
import { getCustomerDetails } from '../api/customerApi';
import AuthContext from '../contexts/AuthContext';

import 'react-native-get-random-values';
import { nanoid } from 'nanoid';
import { useCustomerContext } from '../contexts/CustomerContext';

const logoSvg = `
<svg  xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#34614A" />
  <text x="15" y="280" font-family="Lucida Bright" font-size="120" fill="#ffffff">BARNES</text>
  <text x="15" y="410" font-family="Lucida Bright" font-size="120" fill="#ffffff">&NOTBLE</text>
</svg>
`;

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase, 'Login'>;
}

const LoginScreen = (props: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const loginContext = useContext(AuthContext);
  const { setCustomer } = useCustomerContext();

  const handleLogin = async () => {
    try {
      await login(username, password);
      const customerDetails = await getCustomerDetails(username);
      setCustomer(customerDetails);
      await AsyncStorage.setItem('seed', nanoid());
      loginContext();
    } catch (error: any) {
      setShowError(true);
    }
  };

  const dismissSnackbar = () => {
    setShowError(false);
  };

  const navigateToCreateAccount = () => {
    props.navigation.navigate('CreateCustomerAccount');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <SvgXml xml={logoSvg} width="200" height="200" />
      </View>

      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>
      <Button onPress={navigateToCreateAccount} style={styles.linkButton}>
        Create an account
      </Button>
      <Snackbar visible={showError} onDismiss={dismissSnackbar} duration={3000}>
        Login failed. Please check your credentials and try again.
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 8,
    alignItems: 'center',
  },
});

export default LoginScreen;
