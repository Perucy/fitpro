import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { LoginResponse, RegisterResponse } from '../../types/app';

export default function useAuth() {
    const baseURL = __DEV__ 
        ? 'http://127.0.0.1:8000'  // For simulator/emulator
        : 'https://your-production-api.com'; // For production

    const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${baseURL}/app/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Login failed with status: ${response.status}`);
            }

            if (data.token || data.access_token) {
                await SecureStore.setItemAsync('authToken', data.token || data.access_token);
            }

            if (data.user) {
                await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
            }

            console.log('✅ Logged in to FitPro:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error instanceof Error) {
                if (error.message.includes('Network')) {
                    errorMessage = 'Network error. Please check your connection.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Invalid email or password.';
                } else if (error.message.includes('400')) {
                    errorMessage = 'Please check your email and password format.';
                } else {
                    errorMessage = error.message;
                }
            }

            return { success: false, error: errorMessage };
        }
    }, [baseURL]);

    const register = useCallback(async (email: string, password: string): Promise<RegisterResponse> => {
        try {
            const response = await fetch(`${baseURL}/app/register`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Registration failed with status: ${response.status}`);
            }

            if (data.token || data.access_token) {
                await SecureStore.setItemAsync('authToken', data.token || data.access_token);
            }

            if (data.user) {
                await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
            }

            console.log('✅ Completed user registration:', data);
            return { success: true, data };

        } catch (error) {
            console.error('❌ User registration error:', error);
     
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error instanceof Error) {
                if (error.message.includes('Network')) {
                    errorMessage = 'Network error. Please check your connection.';
                } else if (error.message.includes('409') || error.message.includes('exists')) {
                    errorMessage = 'An account with this email already exists.';
                } else if (error.message.includes('400')) {
                    errorMessage = 'Please check your email and password format.';
                } else {
                    errorMessage = error.message;
                }
            }

            return { success: false, error: errorMessage };
        }
    }, [baseURL]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('userData');
            console.log('✅ User logged out');
        } catch (error) {
            console.error('❌ Logout error:', error);
        }
    }, []);

    const getStoredToken = useCallback(async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync('authToken');
        } catch (error) {
            console.error('❌ Error retrieving token:', error);
            return null;
        }
    }, []);

    const getStoredUserData = useCallback(async () => {
        try {
            const userData = await SecureStore.getItemAsync('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Error retrieving user data:', error);
            return null;
        }
    }, []);

    return { 
        login, 
        register, 
        logout, 
        getStoredToken, 
        getStoredUserData 
    };
}