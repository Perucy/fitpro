import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import type { SpotifyAuthResult } from '../types/spotify';

interface SpotifyStatus {
    connected: boolean;
}

interface AuthResponse {
    auth_url: string;
}

interface UrlEvent {
    url: string;
}

class SpotifyService {
    private baseURL = 'http://127.0.0.1:8000';

    private async getAuthToken(): Promise<string> {
        // Fixed: Use 'authToken' to match useAppAuth hook
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
            throw new Error('User not authenticated. Please log in first.');
        }
        return token;
    }

    // Check if Spotify is linked (uses your backend status endpoint)
    async spotify_checkStatus(): Promise<SpotifyStatus> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/spotify/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                return await response.json();
            }
            return { connected: false };
        } catch (error) {
            console.error('Spotify status check error:', error);
            return { connected: false };
        }
    }

    // Start OAuth flow
    async spotify_authenticate(): Promise<SpotifyAuthResult> {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.getAuthToken();
                
                const response = await fetch(`${this.baseURL}/spotify/auth/login`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to start Spotify authentication');
                }
                
                const { auth_url }: AuthResponse = await response.json();

                // Set up deep link listener for the callback
                const handleUrl = (event: UrlEvent) => {
                    console.log('Received callback:', event.url);
                    
                    const params = this.parseUrlParams(event.url);
                    subscription.remove();
                    
                    if (params.success === 'true') {
                        resolve({
                            success: true,
                            user_id: params.user_id,
                            user_info: JSON.parse(params.user_info || '{}'), // Parse user info from callback
                            message: 'Spotify linked successfully'
                        });
                    } else {
                        reject(new Error(params.message || 'Authentication failed'));
                    }
                };

                const subscription = Linking.addEventListener('url', handleUrl);

                // Open OAuth URL
                await Linking.openURL(auth_url);

                // Timeout after 5 minutes
                setTimeout(() => {
                    subscription.remove();
                    reject(new Error('Authentication timed out'));
                }, 300000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Get Spotify data using your backend endpoints
    async spotify_getProfile(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/spotify/profile`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch Spotify profile');
        } catch (error) {
            console.error('Spotify profile fetch error:', error);
            throw error;
        }
    }
    async spotify_getPlaylist(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/spotify/playlist`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch Spotify playlist');
        } catch (error) {
            console.error('Spotify playlist fetch error:', error);
            throw error;
        }
    }
    async spotify_getCurrentlyPlaying(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/spotify/currently-playing`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Spotify currently playing fetch error:', error);
            return null;
        }
    }
    // Disconnect Spotify using your backend endpoint
    async spotify_disconnect(): Promise<boolean> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/spotify/disconnect`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Spotify disconnect error:', error);
            return false;
        }
    }

    private parseUrlParams(url: string): Record<string, string> {
        const params: Record<string, string> = {};
        
        if (url.includes('?')) {
            const queryString = url.split('?')[1];
            const pairs = queryString.split('&');
            
            for (const pair of pairs) {
                const [key, value] = pair.split('=');
                if (key && value !== undefined) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            }
        }
        
        return params;
    }
}

export default new SpotifyService();