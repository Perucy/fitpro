import { useState, useEffect } from 'react';
import SpotifyService from '../services/SpotifyService';
import type { SpotifyAuthResult } from '../types/spotify';

interface SpotifyStatus {
  connected: boolean;
}

type SpotifyDataType = 'profile';

export function useSpotify() {
  const [isSpotifyLinked, setIsLinked] = useState<boolean>(false);
  const [isSpotifyLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const status: SpotifyStatus = await SpotifyService.spotify_checkStatus();
      setIsLinked(status.connected);
    } catch (error) {
      console.error('Error checking Spotify status:', error);
      setIsLinked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const linkSpotify = async (): Promise<SpotifyAuthResult> => {
    try {
      const result: SpotifyAuthResult = await SpotifyService.spotify_authenticate();
      if (result.success) {
        setIsLinked(true);
      }
      return result;
    } catch (error) {
      console.error('Failed to link Spotify:', error);
      throw error;
    }
  };

  const unlinkSpotify = async (): Promise<boolean> => {
    try {
      const success: boolean = await SpotifyService.spotify_disconnect();
      if (success) {
        setIsLinked(false);
      }
      return success;
    } catch (error) {
      console.error('Failed to unlink Spotify:', error);
      throw error;
    }
  };

  const getSpotifyData = async (dataType: SpotifyDataType): Promise<any> => {
    try {
      if (dataType === 'profile') {
        return await SpotifyService.spotify_getProfile();
      } 
    } catch (error) {
      console.error(`Failed to get Spotify ${dataType}:`, error);
      throw error;
    }
  };

  return {
    isSpotifyLinked,
    isSpotifyLoading,
    linkSpotify,
    unlinkSpotify,
    checkStatus,
    getSpotifyData
  };
}

export default useSpotify;