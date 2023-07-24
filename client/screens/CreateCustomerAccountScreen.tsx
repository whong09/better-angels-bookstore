import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar, TextInput } from 'react-native-paper';
import { createCustomer } from '../api/customerApi';

interface CreateCustomerAccountScreenProps {
  navigation: NavigationProp<ParamListBase, 'CreateCustomerAccount'>;
}

const CreateCustomerAccountScreen = (props: CreateCustomerAccountScreenProps) => {
  const [screen, setScreen] = useState<'first' | 'second'>('first');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [showError, setShowError] = useState(false);
  const navigation = useNavigation();

  const handleNext = () => {
    setScreen('second');
  };

  const handleBack = () => {
    setScreen('first');
  };

  const handleSave = async () => {
    if (password !== confirmPassword) {
      setShowError(true);
      return;
    }

    try {
      await createCustomer({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        email,
        mailing_address: mailingAddress,
      });

      // Account creation success, navigate to the login screen
      alert(`Account created successfully! \nUsername: ${username}`);
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      setShowError(true);
    }
  };

  const dismissSnackbar = () => {
    setShowError(false);
  };

  return (
    <View style={styles.container}>
      {screen === 'first' && (
        <View style={styles.firstScreen}>
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
          <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput
            label="Mailing Address"
            value={mailingAddress}
            onChangeText={setMailingAddress}
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </View>
      )}
      {screen === 'second' && (
        <View style={styles.secondScreen}>
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
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>
      )}
      <View style={styles.navigationButtons}>
        {screen === 'first' && (
          <View style={{ justifyContent: 'flex-end' }}>
            <Button mode="contained" onPress={handleNext}>
              Next
            </Button>
          </View>
        )}

        {screen === 'second' && (
          <>
            <Button mode="contained" onPress={handleBack}>
              Back
            </Button>
            <Button mode="contained" onPress={handleSave}>
              Save
            </Button>
          </>
        )}
      </View>
      <Snackbar visible={showError} onDismiss={dismissSnackbar} duration={3000}>
        Account creation failed. Please check your inputs and try again.
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  firstScreen: {
    flex: 1,
  },
  secondScreen: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});

export default CreateCustomerAccountScreen;
