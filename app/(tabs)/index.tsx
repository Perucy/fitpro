import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import SpotifyService from '../../services/SpotifyService';

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

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
  const testOAuth = async () => {
    try {
      console.log('🔐 Testing full OAuth flow...');
      const result = await SpotifyService.authenticate();
      
      Alert.alert(
        'OAuth Success! 🎉', 
        `Welcome ${result}!`
      );
      
      // Refresh auth status
      await checkAuthStatus();
      
    } catch (error) {
      Alert.alert('OAuth Failed');
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
      
      {isAuthenticated ? (
        <View>
          <Text style={styles.subtitle}>✅ Authenticated as:</Text>
          <Text style={styles.userName}>In</Text>
          <Text style={styles.email}>Out</Text>
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