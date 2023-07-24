import { User } from './UserTypes';

export interface Customer {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  date_joined?: string;
  max_reservations: number;
  current_reservations: number;
  mailing_address: string;
}

export interface CreateCustomer {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  mailing_address: string;
}

export interface CreateCustomerRequest {
  user: User;
  mailing_address: string;
}

export interface UpdateCustomer {
  first_name?: string;
  last_name?: string;
  email?: string;
  mailing_address?: string;
}

export interface UpdateCustomerResponse {
  data: {
    id: string;
    user: User;
    mailing_address: string;
    max_reservations: number;
    current_reservations: number;
  }
}
