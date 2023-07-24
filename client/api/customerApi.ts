import axios from 'axios';
import { CreateCustomer, Customer, UpdateCustomer, UpdateCustomerResponse } from '../types/CustomerTypes';
import { deserializeCustomer, serializeCustomerCreate } from '../utils/customerUtils';
import { API_BASE_URL, API_CUSTOMER_CREATE_PATH, API_CUSTOMER_LOOKUP_PATH, API_CUSTOMER_PATH, API_HEADERS } from './apiConfig';
import axiosInstance from './axiosConfig';

export const createCustomer = async (customer: CreateCustomer): Promise<void> => {
  try {
    await axios.post<Customer>(
      `${API_BASE_URL}${API_CUSTOMER_CREATE_PATH}`,
      serializeCustomerCreate(customer),
      { headers: API_HEADERS }
    );
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const updateCustomer = async (customerId: string | undefined, customerPatch: UpdateCustomer): Promise<Customer> => {
  try {
    const response = await axiosInstance.patch<UpdateCustomerResponse>(
      `${API_BASE_URL}${API_CUSTOMER_PATH}${customerId}`, {
        user: {
          first_name: customerPatch.first_name,
          last_name: customerPatch.last_name,
          email: customerPatch.email
        },
        mailing_address: customerPatch.mailing_address
      }
    );
    return deserializeCustomer(response);
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
  try {
    await axiosInstance.delete<void>(`${API_BASE_URL}${API_CUSTOMER_PATH}${customerId}`);
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getCustomerDetails = async (username: string): Promise<Customer> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}${API_CUSTOMER_LOOKUP_PATH}${username}`);
    return deserializeCustomer(response);
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getCustomerDetailsById = async (id: string): Promise<Customer> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}${API_CUSTOMER_PATH}${id}`);
    return deserializeCustomer(response);
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};