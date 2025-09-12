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
    Dimensions,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import useAuth from './auth';

const { width, height } = Dimensions.get('window')

export default function LoginForm() {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const { login, register } = useAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        return password.length >= 8;
    };

    const validateLoginForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegisterForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        setErrors({});
        
        if (!validateLoginForm()) {
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            router.replace('/(login)/link'); // or wherever you want to navigate after login
            console.log("✅ Successful Login");
        } else {
            Alert.alert('Login Failed', result.error);
            console.log("❌ Login failed:", result.error);
        }
    };

    const handleRegister = async () => {
        setErrors({});

        if (!validateRegisterForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register(email, password);

            if (result.success) {
                Alert.alert(
                    'Registration Successful!',
                    'Your account has been created successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(login)/link') // Navigate after registration
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const clearForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    const switchTab = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        clearForm();
    };

    const handleSubmit = () => {
        if (activeTab === 'login') {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Background Image - Fixed */}
            <ImageBackground
                source={require('../../assets/images/Outdoorcycling-HannahCarr.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />

            {/* Back Button - Fixed Position */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            {/* Scrollable Content with Keyboard Avoidance */}
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Spacer to push card down */}
                    <View style={styles.spacer} />
                    
                    {/* Card */}
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
                            
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    clearError('email');
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                            <TextInput
                                style={[styles.input, errors.password && styles.inputError]}
                                placeholder={activeTab === 'login' ? "Password" : "Password (8+ chars)"}
                                autoComplete="off"
                                textContentType="none"
                                autoCorrect={false}
                                spellCheck={false}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    clearError('password');
                                }}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                            {activeTab === 'signup' && (
                                <>
                                    <TextInput
                                        style={[styles.input, errors.confirmPassword && styles.inputError]}
                                        autoComplete="off"
                                        textContentType="none"
                                        autoCorrect={false}
                                        spellCheck={false}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            clearError('confirmPassword');
                                        }}
                                        secureTextEntry
                                        placeholderTextColor="#999"
                                    />
                                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                                </>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                                    </Text>
                                )}
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
                                        <AntDesign name="apple1" size={24} color="black" />
                                        <Text style={styles.socialButtonText}>Apple</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <AntDesign name="google" size={24} color="black" />
                                        <Text style={styles.socialButtonText}>Google</Text>
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
                    
                    {/* Bottom spacer for extra scroll room */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    
    // Background Image - Now absolutely positioned
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
    },
    
    // Back Button - Fixed position
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },

    // Keyboard avoiding and scroll container
    keyboardAvoidingContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    spacer: {
        height: 160,
    },
    bottomSpacer: {
        height: 50,
    },

    // Card
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        borderRadius: 16,
        padding: 20,
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
        // No flex here
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#ff4757',
    },
    errorText: {
        color: '#ff4757',
        fontSize: 12,
        marginBottom: 12,
        marginTop: -4,
    },
    submitButton: {
        backgroundColor: '#1f2937',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    buttonDisabled: {
        opacity: 0.7,
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