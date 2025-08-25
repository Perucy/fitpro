import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import SpotifyService from '../../services/SpotifyService';
import type { SpotifyUser } from '../../types/spotify';

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);

  // Check auth status when screen loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await SpotifyService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const user = await SpotifyService.getStoredUserInfo();
      setUserInfo(user);
    }
  };
  
  const testBackend = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      const result = await SpotifyService.testConnection();
      Alert.alert('Success!', `Backend says: ${result.message}`);
    } catch (error) {
      Alert.alert('Error', 'Could not connect to backend. Is it running?');
    }
  };

  const testAuthUrl = async () => {
    try {
      console.log('🔗 Testing auth URL generation...');
      const result = await SpotifyService.getAuthUrl();
      Alert.alert('Auth URL Generated!', `State: ${result.state.substring(0, 10)}...`);
    } catch (error) {
      Alert.alert('Error', 'Could not get auth URL from backend');
    }
  };

  // NEW: Test full OAuth flow
  // In your home screen component
  const testOAuth = async () => {
    try {
      console.log('🔐 Testing full OAuth flow...');
      const result = await SpotifyService.authenticate();
      // Type assertion to fix 'unknown' type error
      const oauthResult = result as { user_info: { display_name: string } };
      
      Alert.alert(
        'OAuth Success! 🎉', 
        `Welcome ${oauthResult.user_info.display_name}!`
      );
      
      // Refresh auth status
      await checkAuthStatus();
      
    } catch (error) {
      // console.error('OAuth test error:', error);
      
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Authentication failed';
      
      // Show user-friendly messages based on error type
      if (errorMessage.includes('cancelled')) {
        Alert.alert(
          'Login Cancelled', 
          'No worries! You can try logging in again anytime.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('timeout')) {
        Alert.alert(
          'Login Timeout', 
          'The login process took too long. Please try again.',
          [{ text: 'Try Again', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Login Failed', 
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', style: 'default' }
          ]
        );
      }
    }
  };

    // NEW: Test logout
    const testLogout = async () => {
      try {
        await SpotifyService.logout();
        Alert.alert('Logged Out', 'Successfully logged out');
        await checkAuthStatus();
      } catch (error) {
        Alert.alert('Error', 'Logout failed');
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Spotify App</Text>
      
      {isAuthenticated && userInfo? (
        <View>
          <Text style={styles.subtitle}>✅ Authenticated as:</Text>
          <Text style={styles.userName}>{userInfo.display_name}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
        </View>
      ) : (
        <Text style={styles.subtitle}>❌ Not authenticated</Text>
      )}

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <Button
            title="Test Backend Connection"
            onPress={testBackend}
            color="#1DB954"
          />
        </View>
        
        <View style={styles.buttonSpacing}>
          <Button
            title="Test Auth URL Generation"
            onPress={testAuthUrl}
            color="#FF6B6B"
          />
        </View>

        <View style={styles.buttonSpacing}>
          <Button
            title="🔐 Test Full OAuth Flow"
            onPress={testOAuth}
            color="#1DB954"
          />
        </View>

        {isAuthenticated && (
          <View style={styles.buttonSpacing}>
            <Button
              title="Logout"
              onPress={testLogout}
              color="#FF6B6B"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 250,
  },
  buttonSpacing: {
    marginBottom: 15,
  },
});