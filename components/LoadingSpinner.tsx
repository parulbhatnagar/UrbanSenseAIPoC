/**
 * @file LoadingSpinner.tsx
 * This component provides a simple, reusable SVG-based loading spinner.
 * It's used to give visual feedback to the user during asynchronous operations,
 * such as when waiting for an AI analysis to complete.
 */

import React from 'react';

/**
 * A functional component that renders an animated SVG spinner.
 * It uses Tailwind CSS classes for styling and animation.
 * The `aria-label="Loading"` attribute improves accessibility by informing
 * screen reader users that content is being loaded.
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center" aria-label="Loading">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
