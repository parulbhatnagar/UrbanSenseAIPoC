/**
 * @file CameraView.tsx
 * This component is responsible for accessing and displaying the device's camera feed.
 * It also exposes a method to capture a single frame from the video stream for analysis.
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

/**
 * Defines the props for the CameraView component.
 */
interface CameraViewProps {
  // A callback function to be invoked if there's an error accessing the camera.
  onCameraError: (error: string) => void;
}

/**
 * Defines the handles that this component exposes to its parent.
 * This allows the parent component to call methods on this child component instance.
 */
export interface CameraViewHandles {
  // A function that captures the current video frame and returns it as a base64-encoded string.
  captureFrame: () => string | null;
}

/**
 * The CameraView component.
 * It uses `forwardRef` to allow parent components to get a ref to its instance,
 * which is necessary for calling the `captureFrame` method via `useImperativeHandle`.
 */
const CameraView = forwardRef<CameraViewHandles, CameraViewProps>(({ onCameraError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // An off-screen canvas for frame capture.

  // This effect runs once on component mount to initialize the camera.
  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        // Request access to the user's camera.
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            // Prefer the rear-facing camera ('environment').
            facingMode: 'environment',
            // Suggest ideal resolutions for a balance of quality and performance.
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        // If successful, set the video element's source to the camera stream.
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // If there's an error (e.g., user denies permission), report it to the parent.
        console.error("Error accessing camera:", err);
        if (err instanceof Error) {
            onCameraError(`Camera access denied or unavailable: ${err.message}. Please grant camera permissions.`);
        } else {
            onCameraError("An unknown error occurred while accessing the camera.");
        }
      }
    };

    enableCamera();

    // Cleanup function: This is called when the component unmounts.
    // It stops the camera stream to release the hardware and save battery.
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // The `onCameraError` function is included in the dependency array to satisfy the linter,
  // though in practice it should be stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCameraError]);

  /**
   * `useImperativeHandle` customizes the instance value that is exposed to parent components when using `ref`.
   * Here, we expose a `captureFrame` function.
   */
  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set the canvas dimensions to match the video's actual dimensions.
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Get the 2D drawing context and draw the current video frame onto the canvas.
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Convert the canvas content to a JPEG image, encode it as base64,
          // and return just the data part (stripping the "data:image/jpeg;base64," prefix).
          return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        }
      }
      // Return null if capture is not possible.
      return null;
    }
  }));

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay      // Start playing automatically when the stream is available.
        playsInline   // Required for video to play inline on iOS.
        muted         // Mute the video to prevent any audio feedback from the camera's microphone.
        className="w-full h-full object-cover" // Ensure the video covers the entire container.
      />
      {/* The canvas is used for capturing frames but is not visible to the user. */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

export default CameraView;
