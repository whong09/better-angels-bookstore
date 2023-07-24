import * as SecureStore from 'expo-secure-store';
import token from '../types/AuthTypes';

export const getAccessToken = async () => {
    const tokenJson = await SecureStore.getItemAsync('token');
    return tokenJson ? JSON.parse(tokenJson).access : '';
};

export const saveAccessToken = async (token: token) => {
    await SecureStore.setItemAsync('token', JSON.stringify(token));
};

export const getRefreshToken = async () => {
    const tokenJson = await SecureStore.getItemAsync('token');
    return tokenJson ? JSON.parse(tokenJson).refresh : '';
};

export const deleteAccessToken = async () => {
    await SecureStore.deleteItemAsync('token');
};