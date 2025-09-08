import React, { useState } from "react";
import {
    View,
    Text, 
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
} from 'react-native';
import { router } from 'expo-router';

export default function LoginForm() {
    //tab state
    const [activeTab, setActiveTab] = useState('login');

    //store what the user types
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    //login function from auth context
    //const { login, isLoading } = useAuth();

    // const handleLogin = async () => {
    //     const result = await login
    // }

    // const handleSignUp
    const clearForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    };

    const switchTab = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        clearForm();
    }
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.formContainer}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                        onPress={() => switchTab('login')}
                    >
                    <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                        Sign In
                    </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
                        onPress={() => switchTab('signup')}
                    >
                    <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                        Sign Up
                    </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Welcome</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        padding: 10
    },
    backButtonText: {
        fontSize: 16,
        color: '#A6703A'
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        padding: 4,
        marginBottom: 30,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#A6703A',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: 'white',
    },
})