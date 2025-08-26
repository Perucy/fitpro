import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';

class WhoopService {
    private baseURL = 'http://127.0.0.1:8000';

    private whoop_getErrorMessage(error: unknown) : string {
        if (error instanceof Error) return error.message;
        return String(error);
    }

    async whoop_Connection() {
        try {
            const response = await fetch(`${this.baseURL}/`);
            const data = await response.json();
            console.log('✅ Whoop Backend connection:', data);
            return data;
        } catch (error) {
            console.error('❌ Whoop Backend connection failed:', error);
            throw new Error(`Whoop Backend connection failed: ${this.whoop_getErrorMessage(error)}`);
        }
    }

    async whoop_getAuthUrl() {
        try {
            const response = await fetch(`${this.baseURL}/whoop/auth/login`);
            const data = await response.json();
            console.log('🔗 Got Whoop auth URL:', data);
            return data;
        } catch (error) {
            console.error('❌ Failed to get Whoop auth URL:', error);
            throw new Error(`Failed to get Whoop auth URL: ${this.whoop_getErrorMessage(error)}`);
        }
    }

    async whoop_authenticate() {
        return new Promise(async (resolveDiscoveryAsync, reject) => {
            try {
                console.log('🚀 Starting Whoop manual OAuth flow...');

                const { auth_url, state } = await this.whoop_getAuthUrl();

                // store whoop's backend state
                await SecureStore.setItemAsync('whoop_auth_state', state);
                console.log('🔐 Stored Whoop backend state:', state.substring(0, 8) + '...');

                // set up deep link listener before opening url
                const handleUrl = async (event: { url: string }) => {
                    console.log('📱 Received Whoop callback:', event.url);

                    try {
                        const result = await this.whoop_handleAuthCallback(event.url);
                        subscription.remove();
                        resolveDiscoveryAsync(result);
                    } catch (error) {
                        subscription.remove();
                        reject(error);
                    }
                };

                const subscription = Linking.addEventListener('url', handleUrl);

                console.log('🌐 Opening Whoop auth URL in browser:', auth_url);
                await Linking.openURL(auth_url);

                setTimeout(() => {
                    subscription.remove();
                    reject(new Error('Whoop authentication timed out'));
                }, 300000);
            } catch (error) {
                console.error('❌ Whoop OAuth flow error:', error);
                reject(new Error(`Whoop OAuth flow error: ${this.whoop_getErrorMessage(error)}`));
            }
        });
    }

    private async whoop_handleAuthCallback(url: string) {
        try {
            console.log('🔄 Handling Whoop auth callback...');
            console.log('🔗 Callback URL:', url);

            const params = this.parseUrlParams(url);
            console.log('Parsed Whoop params:', params);

            const error = params.error;
            const code = params.code;
            const state = params.state;
            const cancelled = params.cancelled;
            const success = params.success;
            const userId = params.user_id; // Fixed: use user_id not userId
            const displayName = params.display_name;

            if (cancelled === 'true') {
                console.log('❌ Whoop auth cancelled by user');
                await SecureStore.deleteItemAsync('whoop_auth_state');
                throw new Error('Authentication cancelled by user');
            }

            if (error) {
                console.log('❌ Whoop auth error:', error);
                await SecureStore.deleteItemAsync('whoop_auth_state');
                throw new Error(`Whoop auth error: ${error}`);
            }

            // Backend redirect flow (if your backend redirects directly)
            if (success === 'true' && userId) {
                console.log('✅ Whoop Backend redirect flow detected');
                    
                await SecureStore.deleteItemAsync('whoop_auth_state');
                
                const userResponse = await fetch(`${this.baseURL}/whoop/api/user/${userId}/profile`);
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }
                const userInfo = await userResponse.json();
                
                await SecureStore.setItemAsync('whoop_user_id', userId);
                await SecureStore.setItemAsync('whoop_user_info', JSON.stringify(userInfo));
                
                return {
                    success: true,
                    user_id: userId,
                    user_info: userInfo,
                    message: 'Authentication successful'
                };
            }

            // Direct OAuth callback with code and state
            if (code && state) {
                console.log('✅ Direct Whoop OAuth callback detected');
                console.log('📝 Code:', code.substring(0, 20) + '...');
                console.log('📝 State:', state);
            
                // FIXED: Verify state matches our stored Whoop state (not Spotify state!)
                const storedState = await SecureStore.getItemAsync('whoop_auth_state');
                console.log('🔐 Whoop Stored state:', storedState?.substring(0, 20) + '...');
                console.log('🔐 Whoop Received state:', state.substring(0, 20) + '...');
            
                if (state !== storedState) {
                    await SecureStore.deleteItemAsync('whoop_auth_state');
                    throw new Error(`Whoop State mismatch: expected ${storedState?.substring(0, 10)}..., got ${state.substring(0, 10)}...`);
                }
    
                console.log('✅ Whoop State verified, exchanging code for tokens...');
    
                // Exchange code for tokens via backend
                const tokenResponse = await fetch(`${this.baseURL}/whoop/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
            
                if (!tokenResponse.ok) {
                    const errorText = await tokenResponse.text();
                    console.error('❌ Whoop Token exchange failed:', errorText);
                    await SecureStore.deleteItemAsync('whoop_auth_state');
                    throw new Error(`Whoop Token exchange failed: ${errorText}`);
                }
            
                // Check if response is a redirect
                if (tokenResponse.redirected || tokenResponse.url.includes('fitpro://')) {
                    console.log('🔄 Whoop Backend redirected to mobile app');
                    // Parse the final redirect URL for success parameters
                    const finalUrl = tokenResponse.url;
                    const finalParams = this.parseUrlParams(finalUrl);
                    
                    if (finalParams.success === 'true') {
                        const finalUserId = finalParams.user_id;
                        const finalDisplayName = finalParams.display_name;
                        
                        await SecureStore.deleteItemAsync('whoop_auth_state');
                        await SecureStore.setItemAsync('whoop_user_id', finalUserId);
                        await SecureStore.setItemAsync('whoop_user_info', JSON.stringify({
                            id: finalUserId,
                            display_name: decodeURIComponent(finalDisplayName || 'Whoop User')
                        }));
                        
                        return {
                            success: true,
                            user_id: finalUserId,
                            user_info: {
                                id: finalUserId,
                                display_name: decodeURIComponent(finalDisplayName || 'Whoop User')
                            },
                            message: 'Authentication successful'
                        };
                    }
                }
            
                const userData = await tokenResponse.json();
                console.log('📦 Whoop Token exchange response:', userData);
    
                if (userData.success) {
                    console.log('✅ Whoop Authentication successful!', userData.user_info.display_name);
                    
                    await SecureStore.deleteItemAsync('whoop_auth_state');
                    await SecureStore.setItemAsync('whoop_user_id', userData.user_id);
                    await SecureStore.setItemAsync('whoop_user_info', JSON.stringify(userData.user_info));
                    
                    return {
                        success: true,
                        user_id: userData.user_id,
                        user_info: userData.user_info,
                        message: 'Authentication successful'
                    };
                }
    
                throw new Error(`Whoop Authentication failed: ${userData.message || 'Unknown error'}`);
            }

            throw new Error('No valid authentication response received');
            
        } catch (error) {
            console.error('❌ Whoop Auth callback handling error:', error);
            await SecureStore.deleteItemAsync('whoop_auth_state');
            throw new Error(`Whoop Auth callback handling error: ${this.whoop_getErrorMessage(error)}`);
        }
    }

    private parseUrlParams(url: string): Record<string, string> {
        const params: Record<string, string> = {};
        
        // Handle both regular URLs and custom scheme URLs
        let queryString = '';
        if (url.includes('?')) {
            queryString = url.split('?')[1];
        } else if (url.includes('://') && url.split('://')[1].includes('?')) {
            queryString = url.split('?')[1];
        }

        if (!queryString) return params;

        const pairs = queryString.split('&');

        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key && value !== undefined) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        }

        return params;
    }

    async whoop_isAuthenticated() {
        try {
            const userId = await SecureStore.getItemAsync('whoop_user_id');
            return !!userId;
        } catch {
            return false;
        }
    }
    
    async whoop_StoredUserInfo() {
        try {
            const userInfoStr = await SecureStore.getItemAsync('whoop_user_info');
            return userInfoStr ? JSON.parse(userInfoStr) : null;
        } catch {
            return null;
        }
    }

    async whoop_logout() {
        try {
            await SecureStore.deleteItemAsync('whoop_user_id');
            await SecureStore.deleteItemAsync('whoop_user_info');
            await SecureStore.deleteItemAsync('whoop_auth_state');
            console.log('👋 Whoop logged out');
        } catch (error) {
            console.error('⚠️ Whoop logout error:', error);
            throw new Error(`Whoop logout failed: ${this.whoop_getErrorMessage(error)}`);
        }
    }
}

export default new WhoopService();