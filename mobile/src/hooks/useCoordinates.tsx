// import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

const useCoordinates = (options: Location.LocationOptions = {}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) setError('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync(options);
        if (isMounted) setLocation(currentLocation);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { location, isLoading, error };
};

export default useCoordinates;
