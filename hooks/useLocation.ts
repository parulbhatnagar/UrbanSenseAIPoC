import { useState, useCallback } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    
    setIsRequesting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setIsRequesting(false);
      },
      (err) => {
        let message = "An unknown error occurred.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location access denied.";
            break;
          case err.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
        }
        setError(message);
        setIsRequesting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { location, error, isRequesting, requestLocation };
};
