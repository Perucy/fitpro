import { useState, useEffect } from 'react';
import WhoopService from '../services/WhoopService';
import type { WhoopAuthResult } from '../types/whoop';

interface WhoopStatus {
  connected: boolean;
}

type WhoopDataType = 'profile' | 'recovery';

export function useWhoop() {
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const status: WhoopStatus = await WhoopService.whoop_checkStatus();
      setIsLinked(status.connected);
    } catch (error) {
      console.error('Error checking Whoop status:', error);
      setIsLinked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const linkWhoop = async (): Promise<WhoopAuthResult> => {
    try {
      const result: WhoopAuthResult = await WhoopService.whoop_authenticate();
      if (result.success) {
        setIsLinked(true);
      }
      return result;
    } catch (error) {
      console.error('Failed to link Whoop:', error);
      throw error;
    }
  };

  const unlinkWhoop = async (): Promise<boolean> => {
    try {
      const success: boolean = await WhoopService.whoop_disconnect();
      if (success) {
        setIsLinked(false);
      }
      return success;
    } catch (error) {
      console.error('Failed to unlink Whoop:', error);
      throw error;
    }
  };

  const getWhoopData = async (dataType: WhoopDataType): Promise<any> => {
    try {
      if (dataType === 'profile') {
        return await WhoopService.whoop_getProfile();
      } else if (dataType === 'recovery') {
        return await WhoopService.whoop_getRecovery();
      }
    } catch (error) {
      console.error(`Failed to get Whoop ${dataType}:`, error);
      throw error;
    }
  };

  return {
    isLinked,
    isLoading,
    linkWhoop,
    unlinkWhoop,
    checkStatus,
    getWhoopData
  };
}

export default useWhoop;