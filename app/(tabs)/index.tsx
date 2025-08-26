import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import SpotifyService from '../../services/SpotifyService';
import WhoopService from '../../services/WhoopService';
import type { SpotifyUser } from '../../types/spotify';
import type { WhoopUser } from '../../types/whoop';

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [whoop_isAuthenticated, setWhoopIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [whoop_userInfo, setWhoopUserInfo] = useState<WhoopUser | null>(null);

  // Check auth status when screen loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await SpotifyService.isAuthenticated();
    const whoop_authenticated = await WhoopService.whoop_isAuthenticated();
    setIsAuthenticated(authenticated);
    setWhoopIsAuthenticated(whoop_authenticated);
    
    if (authenticated) {
      const user = await SpotifyService.getStoredUserInfo();
      setUserInfo(user);
    }

    if (whoop_authenticated) {
      const whoop_user = await WhoopService.whoop_StoredUserInfo();
      setWhoopUserInfo(whoop_user);
    } // Fixed: Added missing closing brace
  };
  
  const testBackend = async () => {
    try {
      console.log('Testing backend connection...');
      const result = await SpotifyService.testConnection();
      const whoop_result = await WhoopService.whoop_Connection();
      Alert.alert('Success!', `Spotify Backend says: ${result.message} and Whoop Backend says: ${whoop_result.message}`);
    } catch (error) {
      Alert.alert('Error', 'Could not connect to backend. Is it running?');
    }
  };

  const testAuthUrl = async () => {
    try {
      console.log('Testing auth URL generation...');
      const result = await SpotifyService.getAuthUrl();
      const whoop_result = await WhoopService.whoop_getAuthUrl();
      Alert.alert('Auth URL Generated!', `Spotify State: ${result.state.substring(0, 10)}... and Whoop State: ${whoop_result.state.substring(0, 10)}...`);
    } catch (error) {
      Alert.alert('Error', 'Could not get auth URL from backend');
    }
  };

  // Fixed: Separate OAuth functions for each service
  const testSpotifyOAuth = async () => {
    try {
      console.log('Testing Spotify OAuth flow...');
      const result = await SpotifyService.authenticate();
      const oauthResult = result as { user_info: { display_name: string } };
      Alert.alert(
        'Spotify Success!', 
        `Welcome ${oauthResult.user_info.display_name}!`
      );
      
      // Refresh auth status
      await checkAuthStatus();
      
    } catch (error) {
      handleAuthError(error, 'Spotify');
    }
  };

  const testWhoopOAuth = async () => {
    try {
      console.log('Testing Whoop OAuth flow...');
      const result = await WhoopService.whoop_authenticate();
      const oauthResult = result as { user_info: { display_name: string } };
      Alert.alert(
        'Whoop Success!', 
        `Welcome ${oauthResult.user_info.display_name}!`
      );
      
      // Refresh auth status
      await checkAuthStatus();
      
    } catch (error) {
      handleAuthError(error, 'Whoop');
    }
  };

  // Helper function to handle authentication errors
  const handleAuthError = (error: unknown, service: string) => {
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
        `${service} Login Failed`, 
        errorMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', style: 'default' }
        ]
      );
    }
  };

  // Logout function
  const testLogout = async () => {
    try {
      await SpotifyService.logout();
      await WhoopService.whoop_logout();
      Alert.alert('Logged Out', 'Successfully logged out from both services');
      await checkAuthStatus();
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitPro Integration App</Text>
      
      {/* Spotify Status */}
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Spotify</Text>
        {isAuthenticated && userInfo ? (
          <View>
            <Text style={styles.subtitle}>Authenticated as:</Text>
            <Text style={styles.userName}>{userInfo.display_name}</Text>
            <Text style={styles.email}>{userInfo.email}</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>Not authenticated</Text>
        )}
      </View>

      {/* Whoop Status */}
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Whoop</Text>
        {whoop_isAuthenticated && whoop_userInfo ? (
          <View>
            <Text style={styles.subtitle}>Authenticated as:</Text>
            <Text style={styles.userName}>{whoop_userInfo.display_name}</Text>
            <Text style={styles.email}>{whoop_userInfo.email}</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>Not authenticated</Text>
        )}
      </View>

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
            title="Login to Spotify"
            onPress={testSpotifyOAuth}
            color="#1DB954"
          />
        </View>

        <View style={styles.buttonSpacing}>
          <Button
            title="Login to Whoop"
            onPress={testWhoopOAuth}
            color="#FF6B35"
          />
        </View>

        {(isAuthenticated || whoop_isAuthenticated) && (
          <View style={styles.buttonSpacing}>
            <Button
              title="Logout from All"
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
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonSpacing: {
    marginBottom: 15,
  },
});