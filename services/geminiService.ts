
export const analyzeImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/analyzeImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image, prompt }),
    });

    // Check if the response is not OK and try to parse the error.
    if (!response.ok) {
        let errorMsg = 'An unknown server error occurred.';
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || `Server responded with status: ${response.status}`;
        } catch (e) {
            errorMsg = `Server responded with status: ${response.status}. Could not parse error response.`;
        }

        console.error("Error from serverless function:", errorMsg);

        // Provide user-friendly messages for common errors.
        if (response.status >= 500) {
            return "The AI service is currently unavailable or experiencing issues. Please try again later.";
        }
        if (response.status === 401 || response.status === 403) {
            return "The application is not authorized to use the AI service. Please check the API key configuration.";
        }
        return "An unexpected error occurred while communicating with the AI service.";
    }

    const data = await response.json();
    if (!data.text) {
        return "The AI service returned an empty response. Please try again.";
    }
    return data.text;

  } catch (error) {
    console.error("Network or other error calling analyzeImage function:", error);
    // This catches network errors etc.
    return "Failed to connect to the analysis service. Please check your internet connection and try again.";
  }
};
