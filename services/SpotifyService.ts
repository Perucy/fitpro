import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

class SpotifyService {
  private baseURL = 'http://127.0.0.1:8000';

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/`);
      const data = await response.json();
      console.log('✅ Backend connection:', data);
      return data;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      throw new Error(`Backend connection failed: ${this.getErrorMessage(error)}`);
    }
  }

  async getAuthUrl() {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`);
      const data = await response.json();
      console.log('🔗 Got auth URL:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to get auth URL:', error);
      throw new Error(`Failed to get auth URL: ${this.getErrorMessage(error)}`);
    }
  }

  // NEW: Manual OAuth flow to avoid AuthSession state conflicts
  async authenticate() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🚀 Starting manual OAuth flow...');
        
        const { auth_url, state } = await this.getAuthUrl();
        
        // Store our backend's state
        await SecureStore.setItemAsync('spotify_auth_state', state);
        console.log('🔐 Stored backend state:', state.substring(0, 8) + '...');
        
        // Set up deep link listener BEFORE opening URL
        const handleUrl = async (event: { url: string }) => {
          console.log('📱 Received callback:', event.url);
          
          try {
            const result = await this.handleAuthCallback(event.url);
            subscription.remove();
            resolve(result);
          } catch (error) {
            subscription.remove();
            reject(error);
          }
        };
        
        const subscription = Linking.addEventListener('url', handleUrl);
        
        // Open the auth URL directly in browser
        console.log('🌐 Opening Spotify login...');
        await Linking.openURL(auth_url);
        
        // Set timeout (5 minutes)
        setTimeout(() => {
          subscription.remove();
          reject(new Error('Authentication timeout'));
        }, 300000);
        
      } catch (error) {
        console.error('❌ Manual OAuth error:', error);
        reject(new Error(`OAuth failed: ${this.getErrorMessage(error)}`));
      }
    });
  }

  private async handleAuthCallback(url: string) {
    try {
      console.log('🔄 Processing manual callback...');
      console.log('📋 Callback URL:', url);
      
      const params = this.parseUrlParams(url);
      console.log('🔍 Parsed parameters:', params);
      
      const error = params.error;
      const cancelled = params.cancelled;
      const code = params.code;
      const state = params.state;
      const success = params.success;
      const userId = params.user_id;
      const displayName = params.display_name;

      if (cancelled === 'true') {
        console.log('❌ User cancelled authentication');
        await SecureStore.deleteItemAsync('spotify_auth_state');
        throw new Error('Authentication cancelled by user');
      }

      if (error) {
        await SecureStore.deleteItemAsync('spotify_auth_state');
        throw new Error(`Spotify error: ${error}`);
      }

      // Backend redirect flow (if your backend redirects directly)
      if (success === 'true' && userId) {
        console.log('✅ Backend redirect flow detected');
        
        await SecureStore.deleteItemAsync('spotify_auth_state');
        
        const userResponse = await fetch(`${this.baseURL}/api/user/${userId}/profile`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const userInfo = await userResponse.json();
        
        await SecureStore.setItemAsync('spotify_user_id', userId);
        await SecureStore.setItemAsync('spotify_user_info', JSON.stringify(userInfo));
        
        return {
          success: true,
          user_id: userId,
          user_info: userInfo,
          message: 'Authentication successful'
        };
      }

      // Direct OAuth callback with code and state
      if (code && state) {
        console.log('✅ Direct OAuth callback detected');
        console.log('📝 Code:', code.substring(0, 20) + '...');
        console.log('📝 State:', state);
        
        // Verify state matches our stored state
        const storedState = await SecureStore.getItemAsync('spotify_auth_state');
        console.log('🔐 Stored state:', storedState);
        console.log('🔐 Received state:', state);
        
        if (state !== storedState) {
          await SecureStore.deleteItemAsync('spotify_auth_state');
          throw new Error(`State mismatch: expected ${storedState}, got ${state}`);
        }

        console.log('✅ State verified, exchanging code for tokens...');

        // Exchange code for tokens via backend
        const tokenResponse = await fetch(`${this.baseURL}/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('❌ Token exchange failed:', errorText);
          await SecureStore.deleteItemAsync('spotify_auth_state');
          throw new Error(`Token exchange failed: ${errorText}`);
        }
        
        const userData = await tokenResponse.json();
        console.log('📦 Token exchange response:', userData);

        if (userData.success) {
          console.log('✅ Authentication successful!', userData.user_info.display_name);
          
          await SecureStore.deleteItemAsync('spotify_auth_state');
          await SecureStore.setItemAsync('spotify_user_id', userData.user_id);
          await SecureStore.setItemAsync('spotify_user_info', JSON.stringify(userData.user_info));
          
          return {
            success: true,
            user_id: userData.user_id,
            user_info: userData.user_info,
            message: 'Authentication successful'
          };
        }

        throw new Error(`Authentication failed: ${userData.message || 'Unknown error'}`);
      }

      throw new Error('No valid callback parameters found');
    } catch (error) {
    //   console.error('❌ Manual callback processing failed:', error);
      await SecureStore.deleteItemAsync('spotify_auth_state');
      throw new Error(`Callback failed: ${this.getErrorMessage(error)}`);
    }
  }

  private parseUrlParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const queryStart = url.indexOf('?');
    if (queryStart === -1) return params;
    
    const queryString = url.substring(queryStart + 1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
    
    return params;
  }

  async isAuthenticated() {
    try {
      const userId = await SecureStore.getItemAsync('spotify_user_id');
      return !!userId;
    } catch {
      return false;
    }
  }

  async getStoredUserInfo() {
    try {
      const userInfoStr = await SecureStore.getItemAsync('spotify_user_info');
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch {
      return null;
    }
  }

  async logout() {
    try {
      await SecureStore.deleteItemAsync('spotify_user_id');
      await SecureStore.deleteItemAsync('spotify_user_info');
      await SecureStore.deleteItemAsync('spotify_auth_state');
      console.log('👋 Logged out');
    } catch (error) {
      console.error('⚠️ Logout error:', error);
      throw new Error(`Logout failed: ${this.getErrorMessage(error)}`);
    }
  }
}

export default new SpotifyService();