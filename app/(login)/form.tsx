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
import AppAuth from './auth';

const { width, height } = Dimensions.get('window')

export default function LoginForm() {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { login } = AppAuth();
    const handleLogin = async () => {
        const result = await login(email, password);
        if (result.success){
            console.log("✅Successful Login");
        }else{
            console.log("❌Didn't login");
        }
    }
    const clearForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    };

    const switchTab = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        clearForm();
    };

    const handleSubmit = () => {
        if (activeTab === 'login') {
            handleLogin();
            Alert.alert('Login', `Email: ${email}`);
        } else {
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            Alert.alert('Signup', `Name: ${name}, Email: ${email}`);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" />
            
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <ImageBackground
                    source={require('../../assets/images/Outdoorcycling-HannahCarr.jpg')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.heroOverlay} />
                    
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    
                </ImageBackground>
            </View>

            {/* Card Section */}
            <View style={styles.cardSection}>
                <View style={styles.card}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Welcome</Text>
                    </View>

                    {/* Tabs */}
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

                    {/* Form Inputs */}
                    <View style={styles.formContainer}>
                        {activeTab === 'signup' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#999"
                            />
                        )}

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
                            placeholder={activeTab === 'login' ? "Password" : "Password (8+ chars)"}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#999"
                        />

                        {activeTab === 'signup' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>
                                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        {/* Forgot Password (Login only) */}
                        {activeTab === 'login' && (
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Only show social login for login tab to save space */}
                    {activeTab === 'login' && (
                        <>
                            {/* Social Login Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>Or continue with</Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Social Buttons */}
                            <View style={styles.socialContainer}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Text style={styles.socialButtonText}>🍎 Apple</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Text style={styles.socialButtonText}>📧 Google</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Terms - compact version */}
                    <Text style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms</Text> and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    
    // Hero Section
    heroSection: {
        height: 200, // Smaller hero
    },
    backgroundImage: {
        width: width,
        height: height,
        position: 'absolute',
        top: 0,
        left: 0
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    backButton: {
        marginTop: 50,
        marginLeft: 20,
        padding: 10,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },

    // Card Section
    cardSection: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: -40,
        zIndex: 2,
        paddingBottom: 200,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 15,
    },
    
    // Card Header
    cardHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#1f2937',
    },
    
    // Form
    formContainer: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#1f2937',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPassword: {
        alignItems: 'center',
        marginBottom: 12,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '500',
    },
    
    // Divider
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    dividerText: {
        fontSize: 10,
        color: '#6b7280',
        marginHorizontal: 12,
        textTransform: 'uppercase',
    },
    
    // Social Buttons
    socialContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    socialButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    socialButtonText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    
    // Terms
    termsText: {
        fontSize: 10,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 12,
    },
    termsLink: {
        color: '#3b82f6',
        fontWeight: '500',
    },
});