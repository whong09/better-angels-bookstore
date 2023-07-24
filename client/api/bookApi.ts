import { Book } from '../types/BookTypes';
import { API_BASE_URL, API_HEADERS } from './apiConfig';
import axiosInstance from './axiosConfig';

export const searchBooks = async (
  query: string,
  page: number
): Promise<{ count: number; results: Book[] }> => {
  try {
    const response = await axiosInstance.get<{ count: number; results: Book[] }>(
      `${API_BASE_URL}bookstore/books/search`,
      {
        params: { query: encodeURIComponent(query), page },
        headers: API_HEADERS,
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getPopularBooks = async (page: number): Promise<{ count: number; results: Book[] }> => {
  try {
    const response = await axiosInstance.get<{ count: number; results: Book[] }>(
      `${API_BASE_URL}bookstore/books/popular`,
      { 
        params: { page },
        headers: API_HEADERS 
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};