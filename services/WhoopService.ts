import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import type { WhoopAuthResult } from '../types/whoop';

interface WhoopStatus {
    connected: boolean;
}

interface AuthResponse {
    auth_url: string;
}

interface UrlEvent {
    url: string;
}

class WhoopService {
    private baseURL = 'http://127.0.0.1:8000';

    private async getAuthToken(): Promise<string> {
        // Fixed: Use 'authToken' to match useAppAuth hook
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
            throw new Error('User not authenticated. Please log in first.');
        }
        return token;
    }

    // Check if Whoop is linked (uses your backend status endpoint)
    async whoop_checkStatus(): Promise<WhoopStatus> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/whoop/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                return await response.json();
            }
            return { connected: false };
        } catch (error) {
            console.error('Whoop status check error:', error);
            return { connected: false };
        }
    }

    // Start OAuth flow
    async whoop_authenticate(): Promise<WhoopAuthResult> {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.getAuthToken();
                
                const response = await fetch(`${this.baseURL}/whoop/auth/login`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to start Whoop authentication');
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
                            message: 'Whoop linked successfully'
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

    async whoop_getUserData(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/whoop/user-data`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch Whoop data');
        } catch (error) {
            console.error('Whoop data fetch error:', error);
            throw error;
        }
    }
    // Get Whoop data using your backend endpoints
    async whoop_getProfile(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/whoop/profile`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch Whoop profile');
        } catch (error) {
            console.error('Whoop profile fetch error:', error);
            throw error;
        }
    }

    async whoop_getRecovery(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/whoop/recovery`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch recovery data');
        } catch (error) {
            console.error('Whoop recovery fetch error:', error);
            throw error;
        }
    }
    async whoop_getWorkouts(): Promise<any> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/whoop/workouts`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to fetch recovery data');
        } catch (error) {
            console.error('Whoop recovery fetch error:', error);
            throw error;
        }
    }

    // Disconnect Whoop using your backend endpoint
    async whoop_disconnect(): Promise<boolean> {
        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.baseURL}/whoop/disconnect`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Whoop disconnect error:', error);
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

export default new WhoopService();