# UrbanSenseAI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/parulbhatnagar/UrbanSenseAIPoC/blob/main/LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg)](https://reactjs.org/)

**[Live Demo &raquo;](https://dancing-bubblegum-d8856d.netlify.app/)**

UrbanSenseAI is a progressive web application (PWA) designed to assist visually impaired individuals in navigating urban environments. It uses a smartphone's camera to provide real-time audio descriptions of the surroundings, powered by the Google Gemini AI model.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Installing as a PWA](#installing-as-a-pwa-on-your-phone)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-Time Analysis**: Uses the live camera feed to analyze the environment.
- **Task-Specific Assistance**: Provides targeted help for common urban tasks like finding a bus, crossing a road, exploring surroundings, and locating shops.
- **Multi-Language Support**: Offers audio feedback and UI text in English, Hindi, and Spanish.
- **Text-to-Speech (TTS)**: Reads analysis results aloud for clear, audible feedback in the selected language.
- **Speech Recognition**: Allows for hands-free operation using voice commands (commands are in English).
- **Progressive Web App (PWA)**: Installable on mobile devices for an app-like experience with offline capabilities for the user interface.
- **Simplified Setup**: API key is hardcoded for easy setup across all environments. **Note:** This is generally not recommended for production applications.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **AI**: Google Gemini API (`@google/genai`)
- **Web APIs**: WebRTC (getUserMedia), Web Speech API (SpeechRecognition, SpeechSynthesis)
- **PWA**: Service Workers, Web App Manifest
- **Hosting**: Netlify

---

## Getting Started

The application is configured to work out-of-the-box with a hardcoded API key.

---

## Running Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at the address shown in your terminal (usually `http://localhost:5173`).

---

## Deployment

This project is configured for seamless deployment on Netlify. Since the API key is hardcoded, no environment variables need to be configured on the server.

### Deployment Instructions for Netlify

1.  Push your code to your GitHub Repository.
2.  Log in to Netlify and select "Add new site" -> "Import an existing project".
3.  Connect your GitHub account and select your repository. Netlify will automatically detect and use the settings from `netlify.toml`.
4.  Deploy the site. No further configuration is needed.

## Installing as a PWA on Your Phone

Once deployed, you can install UrbanSenseAI on your phone for the best experience.

1.  Open your live URL in the browser on your phone (Chrome for Android, Safari for iOS).
2.  Follow the on-screen prompt or browser menu option to **"Install App"** or **"Add to Home Screen"**.
3.  Launch the app from its new icon on your home screen.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.