
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="apiKeyModalTitle">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-white border border-teal-500">
        <h2 id="apiKeyModalTitle" className="text-2xl font-bold mb-4 text-teal-300">Set Gemini API Key</h2>
        <p className="mb-4">
          To use this application, you need to provide your Google Gemini API key. Get your key from{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
            Google AI Studio
          </a>.
        </p>
        <p className="mb-4 text-sm text-gray-400">
          Your key will be saved in your browser's local storage for this site.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your API key here"
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Gemini API Key Input"
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-teal-500 rounded-md font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-gray-500"
            disabled={!key.trim()}
          >
            Save and Continue
          </button>
        </div>
        <p className="mt-2 text-xs text-center text-gray-500">
            The app is not functional until a valid key is provided.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
