/**
 * @file useLocation.ts
 * This custom React hook encapsulates the logic for using the browser's Geolocation API.
 * It provides a simple way to request the user's current location and handles the
 * various states associated with that asynchronous request (loading, success, error).
 */

import { useState, useCallback } from 'react';

/**
 * A custom hook to fetch the user's geographical location.
 * @returns An object containing the `location` data, any `error` message,
 *          an `isRequesting` boolean flag, and the `requestLocation` function.
 */
export const useLocation = () => {
  // State to store the successfully retrieved coordinates.
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  // State to store any error message that occurs.
  const [error, setError] = useState<string | null>(null);
  // State to track if a location request is currently in progress.
  const [isRequesting, setIsRequesting] = useState(false);

  /**
   * A memoized function to initiate a request for the user's current position.
   */
  const requestLocation = useCallback(() => {
    // First, check if the browser supports the Geolocation API.
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    
    // Set the state to indicate that a request is starting.
    setIsRequesting(true);
    setError(null); // Clear any previous errors.

    // Call the core Geolocation API method.
    navigator.geolocation.getCurrentPosition(
      // --- Success Callback ---
      (position) => {
        setLocation(position.coords);
        setIsRequesting(false);
      },
      // --- Error Callback ---
      (err) => {
        let message = "An unknown error occurred.";
        // Provide more user-friendly error messages based on the error code.
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
      // --- Options ---
      {
        enableHighAccuracy: true, // Request the most accurate position possible.
        timeout: 10000,           // Set a 10-second timeout to avoid waiting indefinitely.
        maximumAge: 0             // Do not use a cached position; get a fresh one.
      }
    );
  }, []); // `useCallback` with an empty dependency array ensures this function is created only once.

  return { location, error, isRequesting, requestLocation };
};
