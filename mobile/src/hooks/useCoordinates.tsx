import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

const useCoordinates = (options: Location.LocationOptions = {}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const optionsRef = useRef(options);

  // Keep optionsRef updated with the latest options
  optionsRef.current = options;

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) setError('Permission to access location was denied');
          return;
        }

        // Fetch initial location immediately
        const initialLocation = await Location.getCurrentPositionAsync(optionsRef.current);
        if (isMounted) setLocation(initialLocation);

        // Set up interval to refresh every 5 seconds
        intervalId = setInterval(async () => {
          try {
            const currentLocation = await Location.getCurrentPositionAsync(optionsRef.current);
            if (isMounted) setLocation(currentLocation);
          } catch (err: any) {
            if (isMounted) setError(err.message);
          }
        }, 2000); // 5000ms = 5 seconds

      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // Empty dependency array ensures effect runs once

  useEffect(() => {
    console.log(location);
  }, [location]);

  return { location, isLoading, error };
};

export default useCoordinates;