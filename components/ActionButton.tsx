import React from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
  Icon: React.FC<{className: string}>;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, disabled, isProcessing, Icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className="flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-teal-500 text-white rounded-full shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
      aria-label={label}
    >
      {isProcessing ? (
        <LoadingSpinner />
      ) : (
        <>
          <Icon className="w-12 h-12 mb-2" />
          <span className="text-lg font-semibold text-center">{label}</span>
        </>
      )}
    </button>
  );
};

export default ActionButton;