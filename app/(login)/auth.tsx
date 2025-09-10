import React, { useState } from "react";
import {
    View,
    Text, 
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store'
import * as Linking from 'expo-linking';

import type { LoginResponse } from '../../types/app';

const { width, height } = Dimensions.get('window')

export default function AppAuth() {
    const baseURL = 'http://127.0.0.1:8000';

    const login = async (email:string, password:string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log('Data from backend:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: (error as Error).message };
        }
    };
    return { login };
}