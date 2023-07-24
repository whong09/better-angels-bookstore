import { Book } from "./BookTypes";

export interface ReservationRequest {
  customer: string;
  book: string;
  quantity: number;
}

export interface Reservation {
  id: string;
  customer: string;
  book: Book;
  quantity: number;
  date: string;
}