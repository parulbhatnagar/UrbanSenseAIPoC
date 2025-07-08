/**
 * @file constants.ts
 * This file centralizes all the static text content used in the application.
 * This includes AI prompts, UI labels for different languages, and mock data for testing.
 * Centralizing this content makes it easier to manage, update, and localize.
 */

import { AssistanceTask } from './types.ts';

/**
 * A base instruction that is prepended to every prompt sent to the Gemini AI.
 * It sets the context for the AI, defining its persona (UrbanSenseAI), its purpose,
 * and the expected format of its response (clear, concise, descriptive for audio).
 */
const baseSystemInstruction = "You are UrbanSenseAI, a helpful assistant for visually impaired individuals. Your user is pointing their phone camera at their surroundings. Your response will be read aloud, so it must be clear, concise, and descriptive. Focus on safety and awareness. Describe objects and their relative positions (e.g., 'to your left', 'in front of you', '10 meters away'). Do not use markdown or formatting in your response. If GPS coordinates are provided, use them to add geographical context, like identifying street names if signs are visible.";

/**
 * A nested record containing the display labels for each task, localized for different languages.
 * The outer key is the language code (e.g., 'en-US'), and the inner key is the AssistanceTask enum.
 * This allows the UI to display the correct text based on the user's selected language.
 */
export const TASK_LABELS: Record<string, Record<AssistanceTask, string>> = {
  'en-US': {
    [AssistanceTask.FIND_BUS]: "Find Bus",
    [AssistanceTask.CROSS_ROAD]: "Cross Road",
    [AssistanceTask.EXPLORE]: "Explore",
    [AssistanceTask.FIND_SHOP]: "Find Shop",
  },
  'hi-IN': {
    [AssistanceTask.FIND_BUS]: "बस ढूंढें",
    [AssistanceTask.CROSS_ROAD]: "सड़क पार करें",
    [AssistanceTask.EXPLORE]: "अन्वेषण करें",
    [AssistanceTask.FIND_SHOP]: "दुकान ढूंढें",
  },
  'es-ES': {
    [AssistanceTask.FIND_BUS]: "Buscar Bus",
    [AssistanceTask.CROSS_ROAD]: "Cruzar Calle",
    [AssistanceTask.EXPLORE]: "Explorar",
    [AssistanceTask.FIND_SHOP]: "Buscar Tienda",
  }
};

/**
 * A record mapping each AssistanceTask to a specific, detailed prompt for the Gemini AI.
 * Each prompt starts with the `baseSystemInstruction` and then adds task-specific instructions
 * to guide the AI's analysis and response format.
 * The `MUST` keyword is used to emphasize critical requirements for the AI's output.
 */
export const TASK_PROMPTS: Record<AssistanceTask, { prompt: string }> = {
  [AssistanceTask.FIND_BUS]: {
    prompt: `${baseSystemInstruction} Look for a bus in the image. If you see one, read its number and any destination text clearly. You MUST estimate its distance in meters or feet and its location relative to the user (e.g., 'approaching on your right'). For example: 'Bus number 42 to Downtown is about 20 meters away and approaching on your right.' If no bus is visible, state 'I do not see a bus.'`
  },
  [AssistanceTask.CROSS_ROAD]: {
    prompt: `${baseSystemInstruction} Analyze the intersection for crossing a road. Look for pedestrian signals (walk/don't walk signs), traffic lights, and vehicles. Announce the status of the signal. Describe any approaching or stopped vehicles, including their location and estimated distance. For example: 'The pedestrian sign shows a green walk signal. It is safe to cross. There is a blue car stopped about 15 meters away on your left.' or 'The pedestrian sign is red. Do not cross. A red car is approaching from your left, about 30 meters away.'`
  },
  [AssistanceTask.EXPLORE]: {
    prompt: `${baseSystemInstruction} Describe the general scene to give me situational awareness. For all key objects you identify (like benches, doors, obstacles), you MUST estimate their distance in meters or feet and their direction relative to the user. For example: 'You are on a sidewalk next to a park. There is a bench about 3 meters in front of you and a trash can to your immediate right.'`
  },
  [AssistanceTask.FIND_SHOP]: {
    prompt: `${baseSystemInstruction} Scan the image for any shopfronts or business signs. If the user is looking for a specific type of shop, prioritize that in your search. Read the names of any shops you can identify, and you MUST estimate their distance and direction. For example: 'I see a sign for a pharmacy about 10 meters ahead and to your right.' If you cannot identify any shops, state 'I do not see any shop signs.'`
  }
};

/**
 * A record of mock (fake) AI responses for each task.
 * This is used when "Mock Mode" is enabled in the settings. It allows developers or users
 * to test the application's UI and text-to-speech functionality without making actual API calls
 * and incurring costs.
 */
export const MOCK_RESPONSES: Record<AssistanceTask, string> = {
  [AssistanceTask.FIND_BUS]: "I see bus number 123 to 'City Center' arriving on your right in about 15 meters.",
  [AssistanceTask.CROSS_ROAD]: "The pedestrian signal is green, it is safe to cross. A blue car is waiting on your left.",
  [AssistanceTask.EXPLORE]: "You are on a sidewalk next to a park. There is a bench 5 meters in front of you and a trash can to your right.",
  [AssistanceTask.FIND_SHOP]: "I can see a 'Corner Coffee Shop' about 20 meters ahead and to your left."
};
