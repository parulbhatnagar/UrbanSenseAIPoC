import React, { useEffect, useRef } from 'react';
import { LANGUAGES } from '../App.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLangCode: string;
  onLangChange: (langCode: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentLangCode, onLangChange }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus(); // Focus the modal for screen readers and keyboard nav
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm text-white border border-teal-500"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        tabIndex={-1} // Make the div focusable
      >
        <h2 id="settings-title" className="text-2xl font-bold text-teal-300 mb-4">
          Settings
        </h2>
        
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
