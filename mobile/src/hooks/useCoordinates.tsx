import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

const useCoordinates = (
  {
    keepRefreshing = false,
    refreshTimeInterval = 5000,
    options = {}
  }: {
    keepRefreshing?: boolean;
    refreshTimeInterval?: number;
    options?: Location.LocationOptions;
  } = {}
) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevLocationRef = useRef<Location.LocationObject | null>(null);
  const optionsRef = useRef(options);
  const isMountedRef = useRef(true);

  // Update refs when props change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const updateLocation = useCallback(async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync(optionsRef.current);
      
      // Check if coordinates actually changed
      const hasChanged = !prevLocationRef.current || 
        currentLocation.coords.latitude !== prevLocationRef.current.coords.latitude ||
        currentLocation.coords.longitude !== prevLocationRef.current.coords.longitude;

      if (hasChanged && isMountedRef.current) {
        setLocation(currentLocation);
        prevLocationRef.current = currentLocation;
      }
    } catch (err: any) {
      if (isMountedRef.current) setError(err.message);
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (isMountedRef.current) setError('Permission to access location was denied');
          return;
        }

        // Initial location fetch
        await updateLocation();

        // Set up interval if needed
        if (keepRefreshing) {
          intervalId = setInterval(updateLocation, refreshTimeInterval);
        }
      } catch (err: any) {
        if (isMountedRef.current) setError(err.message);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    requestLocation();

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [keepRefreshing, refreshTimeInterval, updateLocation]);

  // Deduplicated logging
  useEffect(() => {
    if (location && location !== prevLocationRef.current) {
      console.log('New coordinates:', location.coords);
    }
  }, [location]);

  return { location, isLoading, error };
};

export default useCoordinates;