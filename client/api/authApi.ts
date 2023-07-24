import axios from 'axios';
import { saveAccessToken } from '../utils/tokenUtils';
import { API_BASE_URL, API_HEADERS, API_JWT_TOKEN_PATH } from './apiConfig';

export const login = async (username: string, password: string): Promise<void> => {
  try {
    const payload = {
      username,
      password,
    };
    const response = await axios.post(`${API_BASE_URL}${API_JWT_TOKEN_PATH}`, payload, { headers: API_HEADERS });

    saveAccessToken(response.data);
  } catch (error) {
    // Handle error
    throw error;
  }
};
