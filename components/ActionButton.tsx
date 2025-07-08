/**
 * @file ActionButton.tsx
 * A reusable, styled button component for the main user actions (e.g., "Find Bus").
 * It integrates an icon, a label, and handles processing/disabled states.
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

/**
 * Defines the props accepted by the ActionButton component.
 */
interface ActionButtonProps {
  // The text label displayed on the button. Also used for the aria-label.
  label: string;
  // The function to call when the button is clicked.
  onClick: () => void;
  // A boolean to disable the button, e.g., when another action is in progress.
  disabled: boolean;
  // A boolean to indicate that this specific button's action is currently processing.
  isProcessing: boolean;
  // The SVG icon component to display on the button.
  Icon: React.FC<{className: string}>;
}

/**
 * The ActionButton component.
 * It conditionally renders either the icon and label or a LoadingSpinner
 * based on the `isProcessing` prop.
 */
const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, disabled, isProcessing, Icon }) => {
  return (
    <button
      onClick={onClick}
      // The button is disabled if the generic `disabled` prop is true or if this specific action is processing.
      disabled={disabled || isProcessing}
      // Tailwind CSS classes for styling. `disabled:*` classes apply styles when the button is disabled.
      className="flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-teal-500 text-white rounded-full shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
      // Accessibility: provides a descriptive label for screen readers.
      aria-label={label}
    >
      {isProcessing ? (
        // If this button's action is processing, show the spinner.
        <LoadingSpinner />
      ) : (
        // Otherwise, show the icon and label.
        <>
          <Icon className="w-12 h-12 mb-2" />
          <span className="text-lg font-semibold text-center">{label}</span>
        </>
      )}
    </button>
  );
};

export default ActionButton;
