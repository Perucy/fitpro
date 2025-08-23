import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

class SpotifyService {
  private baseURL = 'http://127.0.0.1:8000';

  // Helper to handle unknown errors
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

  async authenticate() {
    try {
      console.log('🚀 Starting OAuth flow...');
      
      const { auth_url, state } = await this.getAuthUrl();
      
      await SecureStore.setItemAsync('spotify_auth_state', state);
      
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'your-app-scheme'
      });
      
      console.log('🔄 Redirect URI:', redirectUri);
      
      const request = new AuthSession.AuthRequest({
        clientId: 'dummy',
        scopes: [],
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });
      
      const result = await request.promptAsync({
        authorizationEndpoint: auth_url,
      });
      
      console.log('📱 OAuth result:', result.type);
      
      if (result.type === 'success') {
        return await this.handleAuthCallback(result.url || '');
      } else {
        throw new Error(`OAuth ${result.type}`);
      }
    } catch (error) {
      console.error('❌ OAuth error:', error);
      throw new Error(`OAuth failed: ${this.getErrorMessage(error)}`);
    }
  }

  private async handleAuthCallback(url: string) {
    try {
      console.log('🔄 Processing callback...');
      console.log('📋 Callback URL:', url);
      
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');

      if (error) {
        throw new Error(`Spotify error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing code or state');
      }

      const storedState = await SecureStore.getItemAsync('spotify_auth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      const response = await fetch(`${this.baseURL}/auth/callback?code=${code}&state=${state}`);
      const userData = await response.json();

      if (userData.success) {
        console.log('✅ OAuth successful!', userData.user_info.display_name);
        
        await SecureStore.setItemAsync('spotify_user_id', userData.user_id);
        await SecureStore.setItemAsync('spotify_user_info', JSON.stringify(userData.user_info));
        
        return userData;
      }

      throw new Error('Token exchange failed');
    } catch (error) {
      console.error('❌ Callback processing failed:', error);
      throw new Error(`Callback failed: ${this.getErrorMessage(error)}`);
    }
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