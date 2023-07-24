import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Divider, Text, TextInput } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { updateCustomer } from '../api/customerApi';
import { useCustomerContext } from '../contexts/CustomerContext';
import createAvatar from '../utils/avatarUtil';

const date_format = 'MMMM dd, yyyy';

interface CustomerDetailsScreenProps {
  navigation: NavigationProp<ParamListBase, 'CustomerDetails'>;
}

const CustomerDetailsScreen = (props: CustomerDetailsScreenProps) => {
  const { customer, setCustomer } = useCustomerContext();
  const [avatarSvg, setAvatarSvg] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(customer!.first_name + ' ' + customer!.last_name);
  const [editedEmail, setEditedEmail] = useState(customer!.email);
  const [editedAddress, setEditedAddress] = useState(customer!.mailing_address);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');

  const generateAvatar = async () => {
    try {
      const seed = await AsyncStorage.getItem('seed');
      setAvatarSvg(createAvatar(seed || customer?.id));
    } catch (error) {
      console.error('Error loading customer details:', error);
      props.navigation.navigate('Logout');
    }
  };

  // this is purely because I know the format for most addresses
  const formatCustomerAddress = (address: string | undefined) => {
    try {
      // @ts-ignore
      const addressParts = address.split(',');
      const street = addressParts[0].trim();
      const city = addressParts[1].trim();
      const state = addressParts[2].trim();
      const zip = addressParts[2].trim();
      return `${street}\n${city}, ${state}\n${zip}`;
    } catch (error) {
      // fail silently, some strings will not fit this format
      return address;
    }
  };

  useEffect(() => {
    generateAvatar();
  }, []);

  const toggleEditMode = async () => {
    if (editMode) {
      const nameSplit = editedName.split(' ');
      const customerUpdate = {
        email: editedEmail,
        first_name: nameSplit.length > 1 ? nameSplit.slice(0, nameSplit.length - 1).join(' ') : '',
        last_name: nameSplit.length > 1 ? nameSplit[nameSplit.length - 1] : editedName,
        mailing_address: editedAddress.replaceAll('\n', ', '),
      };

      const updatedCustomer = await updateCustomer(customer?.id, customerUpdate);
      setCustomer(updatedCustomer);
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  const showEditModal = (field: string, value: string) => {
    setModalField(field);
    setModalValue(value);
    setIsModalVisible(true);
  };

  const hideEditModal = () => {
    setIsModalVisible(false);
  };

  const saveChanges = () => {
    switch (modalField) {
      case 'name':
        setEditedName(modalValue);
        break;
      case 'email':
        setEditedEmail(modalValue);
        break;
      case 'address':
        setEditedAddress(modalValue);
        break;
    }
    hideEditModal();
  };

  return (
    <View style={styles.container}>
      <SvgXml xml={avatarSvg} width="200" height="200" />
      {editMode ? (
        <TouchableOpacity onPress={() => showEditModal('name', editedName)}>
          <Text style={styles.editableHeader}>{editedName}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.header}>{`${customer?.first_name} ${customer?.last_name}`}</Text>
      )}
      <View style={styles.detailsPanel}>
        <View style={styles.detailsFieldsPanel}>
          <View style={styles.detailRowContainer}>
            <Text style={styles.reservationText}>Reservations </Text>
            <Text style={styles.reservationNumbers}>
              {'\n' + `${customer!.current_reservations} / ${customer!.max_reservations}`}
            </Text>
          </View>
          <Divider bold={true} />
          <View style={styles.detailRowContainer}>
            <Text style={styles.detailLabel}>Email</Text>
            {editMode ? (
              <TouchableOpacity onPress={() => showEditModal('email', editedEmail)}>
                <Text style={styles.editableField}>{'\n' + editedEmail}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.detailText}>{'\n' + editedEmail}</Text>
            )}
          </View>
          <Divider bold={true} />
          <View style={styles.detailRowContainer}>
            <Text style={styles.detailLabel}>Joined</Text>
            <Text style={styles.detailText}>
              {'\n' + format(new Date(customer!.date_joined || 0), date_format)}
            </Text>
          </View>
          <Divider bold={true} />
          <View style={styles.detailRowContainer}>
            <Text style={styles.detailLabel}>Address</Text>
            {editMode ? (
              <TouchableOpacity onPress={() => showEditModal('address', editedAddress)}>
                <Text style={styles.editableField}>
                  {'\n' + formatCustomerAddress(editedAddress)}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.detailText}>{'\n' + formatCustomerAddress(editedAddress)}</Text>
            )}
          </View>
        </View>
        {editMode && (
          <View style={styles.editButtonContainer}>
            <Button
              mode="contained"
              onPress={() => setEditMode(false)}
              style={styles.editCancelButton}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Button>
            <Button mode="contained" onPress={toggleEditMode} style={styles.editSaveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </Button>
          </View>
        )}
        {!editMode && (
          <Button mode="contained" onPress={toggleEditMode} style={styles.editButton}>
            <Text style={styles.buttonText}>Edit</Text>
          </Button>
        )}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalTextInput}
                value={modalValue}
                onChangeText={setModalValue}
              />
              <View style={styles.modalButtonsContainer}>
                <Button onPress={hideEditModal}>Cancel</Button>
                <Button onPress={saveChanges}>OK</Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editableHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textDecorationLine: 'underline',
    color: '#9370DB',
  },
  detailsPanel: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    justifyContent: 'space-between',
  },
  detailsFieldsPanel: {
    flex: 1,
    width: '100%',
  },
  detailRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationText: {
    fontSize: 20,
    fontWeight: 'normal',
    marginBottom: 8,
  },
  reservationNumbers: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  editableField: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
    textDecorationLine: 'underline',
    color: '#9370DB',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editCancelButton: {
    marginTop: 16,
    width: 150,
    height: 55,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#CD5C5C',
  },
  editSaveButton: {
    marginTop: 16,
    width: 150,
    height: 55,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#6B8E23',
  },
  editButton: {
    marginTop: 16,
    width: 150,
    height: 55,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#9370DB',
  },
  buttonText: {
    fontSize: 20,
    color: '#FFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#D6E4FF',
    padding: 16,
    borderRadius: 8,
    width: '80%',
  },
  modalTextInput: {
    fontSize: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default CustomerDetailsScreen;
