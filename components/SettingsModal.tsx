/**
 * @file SettingsModal.tsx
 * This component renders a modal dialog for changing application settings,
 * such as language and developer options (e.g., mock mode).
 */

import React, { useEffect, useRef } from 'react';
import { LANGUAGES } from '../App.tsx'; // Import the centralized language definitions.

/**
 * Defines the props accepted by the SettingsModal component.
 */
interface SettingsModalProps {
  // A boolean to control whether the modal is open or closed.
  isOpen: boolean;
  // A callback function to be called when the modal should be closed.
  onClose: () => void;
  // The currently selected language code.
  currentLangCode: string;
  // A callback function to update the language in the parent component.
  onLangChange: (langCode: string) => void;
  // A boolean indicating if mock mode is currently enabled.
  isMockMode: boolean;
  // A callback function to toggle mock mode in the parent component.
  onMockModeChange: (enabled: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentLangCode, onLangChange, isMockMode, onMockModeChange }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // This effect handles keyboard controls for the modal (e.g., closing with the Escape key).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // When the modal opens, focus it to improve accessibility for keyboard and screen reader users.
      modalRef.current?.focus();
    }

    // Cleanup: remove the event listener when the modal closes or the component unmounts.
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // If the modal is not open, render nothing.
  if (!isOpen) {
    return null;
  }

  return (
    // The modal overlay, which covers the entire screen.
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose} // Clicking the overlay closes the modal.
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title" // Associates the dialog with its title for screen readers.
    >
      {/* The modal content itself. */}
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm text-white border border-teal-500"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it.
        tabIndex={-1} // Makes the div focusable.
      >
        <h2 id="settings-title" className="text-2xl font-bold text-teal-300 mb-4">
          Settings
        </h2>
        
        {/* Language Selection Section */}
        <fieldset>
          <legend className="text-lg font-semibold mb-3">Language</legend>
          <div className="space-y-2">
            {LANGUAGES.map((lang) => (
              <label key={lang.code} className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value={lang.code}
                  checked={currentLangCode === lang.code}
                  onChange={() => onLangChange(lang.code)}
                  className="w-5 h-5 text-teal-500 bg-gray-900 border-gray-600 focus:ring-teal-500 focus:ring-2"
                />
                <span className="ml-3 text-md">{lang.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Developer Options Section */}
        <fieldset className="mt-6 pt-4 border-t border-gray-700">
            <legend className="text-lg font-semibold mb-3">Developer</legend>
            <label htmlFor="mock-toggle" className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <div>
                  <span className="text-md font-medium text-white">Enable Mock Mode</span>
                  <p className="text-sm text-gray-400 mt-1">Simulates AI responses for testing without an API key.</p>
                </div>
                {/* A custom-styled toggle switch */}
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="mock-toggle" 
                    className="sr-only peer" // Hides the default checkbox but keeps it accessible.
                    checked={isMockMode}
                    onChange={(e) => onMockModeChange(e.target.checked)}
                  />
                  {/* The visible part of the toggle switch, styled with Tailwind CSS. */}
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 peer-focus:ring-opacity-50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </div>
            </label>
        </fieldset>

        {/* Close Button */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
