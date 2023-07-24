import { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Button, Portal, Snackbar } from 'react-native-paper';
import { deleteReservation, getAllReservations } from '../api/reservationApi';
import { Reservation } from '../types/ReservationTypes';
import { Ionicons } from '@expo/vector-icons';
import { useBadgeContext } from '../contexts/BadgeContext';
import { useReservationContext } from '../contexts/ReservationContext';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface CustomerReservationsScreenProps {
  navigation: NavigationProp<ParamListBase, 'CustomerReservations'>;
}

const CustomerReservationsScreen = (props: CustomerReservationsScreenProps) => {
  const { reservations, setReservations } = useReservationContext();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { setReservationsBadge } = useBadgeContext();

  const fetchReservations = async () => {
    try {
      const reservationsData = await getAllReservations();
      setReservationsBadge(reservationsData.length);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleDeleteReservation = async () => {
    try {
      if (selectedReservation) {
        await deleteReservation(selectedReservation.id);
        const updatedReservations = await getAllReservations();
        setReservations(updatedReservations);
        setReservationsBadge(updatedReservations?.length || null);
        setSnackbarVisible(true);
      }
      setSelectedReservation(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const showModal = (item: Reservation) => {
    setSelectedReservation(item);
    setModalVisible(true);
  };

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <TouchableOpacity style={styles.reservationItem} onPress={() => setSelectedReservation(item)}>
      <View style={styles.reservationInfo}>
        <Text style={styles.bookTitle}>{item.book.title}</Text>
        <Text style={styles.bookAuthor}>Author: {item.book.author}</Text>
        <Text style={styles.bookGenre}>Genre: {item.book.genre}</Text>
        <Text style={styles.reservationDate}>Reserved on: {item.date}</Text>
        <Text style={styles.reservationQuantity}>Quantity reserved: {item.quantity}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => showModal(item)}>
        <Ionicons name="trash" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {reservations?.length === 0 && (
        <View style={styles.noReservationsContainer}>
          <Text style={styles.noReservationsText}>No reservations found.</Text>
        </View>
      )}
      <FlatList
        data={reservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <Portal>
        <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} transparent>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Delete Reservation</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete the reservation for "{selectedReservation?.book.title}
              "?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
                color="#4CAF50"
              >
                No
              </Button>
              <Button
                mode="contained"
                onPress={handleDeleteReservation}
                style={styles.modalButton}
                color="#F44E4E"
              >
                Yes
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Reservation deleted successfully!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  reservationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  reservationInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  bookGenre: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  reservationDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  reservationQuantity: {
    fontSize: 14,
    color: '#777',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44E4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
    borderRadius: 8,
  },
  noReservationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReservationsText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomerReservationsScreen;
