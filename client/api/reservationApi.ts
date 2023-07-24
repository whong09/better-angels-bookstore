// reservationApi.ts
import { Reservation, ReservationRequest } from '../types/ReservationTypes';
import { API_BASE_URL, API_RESERVATION_PATH } from './apiConfig';
import axiosInstance from './axiosConfig';

export const makeReservation = async (reservation: ReservationRequest): Promise<void> => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}${API_RESERVATION_PATH}`, reservation);
    if (response.status === 201 || response.status === 200) {
      // Reservation successful
      alert(`Book reserved. Reservation ID: ${response.data.id}`);
    } else {
      throw new Error(`Reservation failed ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error making reservation:', error.message);
    throw(error);
  }
};

export const getAllReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}${API_RESERVATION_PATH}`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Error fetching reservations ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error fetching reservations:', error.message);
    throw error;
  }
};

export const deleteReservation = async (reservationId: string): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}${API_RESERVATION_PATH}${reservationId}`);
    if (response.status === 200) {
      alert('Reservation deleted successfully!');
    } else {
      throw new Error(`Error deleting reservation ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error deleting reservation:', error.message);
    throw error;
  }
};
