import { NavigationProp, ParamListBase } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  IconButton,
  Modal,
  PaperProvider,
  Text as PaperText,
  TextInput as PaperTextInput,
  Portal,
  Snackbar,
} from 'react-native-paper';
import { getPopularBooks, searchBooks } from '../api/bookApi';
import { getAllReservations, makeReservation } from '../api/reservationApi';
import { getCustomerDetailsById } from '../api/customerApi';
import { Book } from '../types/BookTypes';
import { ReservationRequest } from '../types/ReservationTypes';

import { useBadgeContext } from '../contexts/BadgeContext';
import { useCustomerContext } from '../contexts/CustomerContext';
import { useReservationContext } from '../contexts/ReservationContext';

const PAGE_SIZE = 50;

interface BookstoreScreenProps {
  navigation: NavigationProp<ParamListBase, 'Bookstore'>;
}

const BookstoreScreen = (props: BookstoreScreenProps) => {
  const [searchText, setSearchText] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookInStock, setBookInStock] = useState(true);
  const [quantity, setQuantity] = useState('0');
  const [visible, setVisible] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { customer, setCustomer } = useCustomerContext();
  const { reservations, setReservations } = useReservationContext();
  const { setBadge, setReservationsBadge } = useBadgeContext();

  const showModal = (item: Book) => {
    setSelectedBook(item);
    setBookInStock(item.quantity > 0);
    setVisible(true);
  };

  const hideModal = () => {
    setSelectedBook(null);
    setVisible(false);
  };

  const showError = (error: string) => {
    setErrorText(error);
    setSnackbarVisible(true);
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  const loadBooks = async () => {
    try {
      if (!searchText) {
        const response = await getPopularBooks(currentPage);
        setBooks(response.results);
        setTotalPages(Math.ceil(response.count / PAGE_SIZE));
        setBadge(response.count);
        return;
      }
      if (searchText.length < 3 || searchText.length > 50) {
        showError('Please enter a search term between 3 and 50 characters.');
        return;
      }
      const response = await searchBooks(searchText, currentPage);
      setBooks(response.results);
      setTotalPages(Math.ceil(response.count / PAGE_SIZE));
      setBadge(response.count);
    } catch (error) {
      showError(`Error loading books:${error}`);
    }
  };

  const loadReservations = async () => {
    try {
      const reservations = await getAllReservations();
      setReservations(reservations);
      setReservationsBadge(reservations?.length || null);
    } catch (error) {
      showError(`Error loading reservations:${error}`);
    }
  };

  useEffect(() => {
    loadBooks();
    loadReservations();
  }, [currentPage]);

  const handleSearch = () => {
    if (searchText.length < 3 || searchText.length > 50) {
      showError('Please enter a search term between 3 and 50 characters.');
      return;
    }
    setCurrentPage(1);
    loadBooks();
  };

  const handleReserve = async () => {
    try {
      Keyboard.dismiss();
      const quantityValue = parseInt(quantity, 10);
      if (isNaN(quantityValue) || quantityValue <= 0) {
        showError('Invalid quantity. Please enter a valid number of books to reserve.');
        return;
      }
      if (quantityValue > (selectedBook?.quantity || 0)) {
        showError('Invalid quantity. Please enter a reservable quantity.');
        return;
      }
      if (quantityValue + customer!.current_reservations > customer!.max_reservations) {
        showError('Invalid quantity. You have reached your maximum number of reservations.');
        return;
      }

      const reservation: ReservationRequest = {
        book: selectedBook!.id,
        customer: customer!.id,
        quantity: quantityValue,
      };

      await makeReservation(reservation);
      setCustomer(await getCustomerDetailsById(customer!.id));

      loadReservations();
      loadBooks();
      hideModal();
    } catch (error) {
      showError(`Error making reservation:${error}`);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1));
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => showModal(item)}>
      <PaperText style={styles.bookTitle}>{item.title}</PaperText>
      <PaperText style={styles.bookAuthor}>Author: {item.author}</PaperText>
      <PaperText style={styles.bookGenre}>Genre: {item.genre}</PaperText>
      {item.quantity > 0 ? (
        <PaperText style={styles.bookQuantity}>{item.quantity} in stock</PaperText>
      ) : (
        <PaperText style={styles.bookOutOfStock}>Out of stock</PaperText>
      )}
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <View style={books.length == 0 ? styles.containerDark : styles.containerBright}>
        <View style={styles.searchBar}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search Books"
            style={styles.searchInput}
          />
          <IconButton icon="magnify" onPress={handleSearch} />
        </View>
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id || ''}
          onEndReached={() => handleNextPage()}
          onEndReachedThreshold={0.1}
        />
        <View style={styles.pagingControls}>
          {currentPage > 1 && <IconButton icon="skip-previous" onPress={handleFirstPage} />}
          {currentPage > 1 && <IconButton icon="chevron-left" onPress={handlePrevPage} />}
          {currentPage < totalPages && <IconButton icon="chevron-right" onPress={handleNextPage} />}
          {currentPage < totalPages && <IconButton icon="skip-next" onPress={handleLastPage} />}
        </View>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalHeader}>Reserve</Text>
            <View style={styles.bookInfoContainer}>
              <PaperText style={styles.bookTitle}>{selectedBook?.title}</PaperText>
              <PaperText style={styles.bookAuthor}>{selectedBook?.author}</PaperText>
              {bookInStock ? (
                <PaperText style={styles.bookQuantity}>
                  Quantity in stock: {selectedBook?.quantity}
                </PaperText>
              ) : (
                <PaperText style={styles.bookOutOfStock}>Out of stock</PaperText>
              )}
              {bookInStock && (
                <View style={styles.quantityContainer}>
                  <PaperTextInput
                    mode="outlined"
                    placeholder="Enter quantity"
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    style={styles.quantityInput}
                  />
                  <Button mode="contained" onPress={handleReserve} style={styles.reserveButton}>
                    Reserve
                  </Button>
                </View>
              )}
            </View>
          </Modal>
        </Portal>
        <Snackbar visible={snackbarVisible} onDismiss={dismissSnackbar} duration={3000}>
          {errorText}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  containerDark: {
    flex: 1,
    padding: 16,
    backgroundColor: '#eee',
  },
  containerBright: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    backgroundColor: '#eee',
    borderRadius: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
  },
  bookItem: {
    marginBottom: 16,
    padding: 8,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  pagingControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookInfoContainer: {
    marginBottom: 16,
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
  bookQuantity: {
    fontSize: 14,
    color: '#077',
  },
  bookOutOfStock: {
    fontSize: 14,
    color: '#707',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    marginRight: 8,
    height: 40,
  },
  reserveButton: {
    borderRadius: 8,
    height: 40,
    backgroundColor: '#9370DB',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
});

export default BookstoreScreen;
