# UrbanSenseAI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/parulbhatnagar/UrbanSenseAI/blob/main/LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg)](https://reactjs.org/)

**[Live Demo &raquo;](https://your-deployment-link-here.netlify.app/)**

UrbanSenseAI is a progressive web application (PWA) designed to assist visually impaired individuals in navigating urban environments. It uses a smartphone's camera to provide real-time audio descriptions of the surroundings, powered by the Google Gemini AI model.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Installing as a PWA](#installing-as-a-pwa-on-your-phone)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-Time Analysis**: Uses the live camera feed to analyze the environment.
- **Task-Specific Assistance**: Provides targeted help for common urban tasks like finding a bus, crossing a road, exploring surroundings, and locating shops.
- **Text-to-Speech (TTS)**: Reads analysis results aloud for clear, audible feedback.
- **Speech Recognition**: Allows for hands-free operation using voice commands.
- **Progressive Web App (PWA)**: Installable on mobile devices for an app-like experience with offline capabilities for the user interface.
- **Secure API Key Storage**: Prompts for a Gemini API key on first use and stores it securely in the browser's local storage.

---

## Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: TailwindCSS (via CDN)
- **AI**: Google Gemini API (`@google/genai`)
- **Web APIs**: WebRTC (getUserMedia), Web Speech API (SpeechRecognition, SpeechSynthesis)
- **PWA**: Service Workers, Web App Manifest

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and npm (which comes with Node.js) installed on your computer.

You will also need a **Google Gemini API Key**. You can obtain one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Local Setup & Running

**Important**: This web application cannot be run by simply opening the `index.html` file in a browser due to security restrictions (`file://` protocol). It must be served by a web server.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/parulbhatnagar/UrbanSenseAI.git
    cd UrbanSenseAI
    ```

2.  **Install a local server:**
    We will use `serve`, a simple static server. Open your terminal or command prompt and run:
    ```sh
    npm install -g serve
    ```

3.  **Start the server:**
    From your project's root directory, run:
    ```sh
    serve
    ```

4.  **Access the application:**
    The terminal will show you a "Local" address, typically `http://localhost:3000`. Open this URL in your web browser. The app should now be running.

5.  **Set the API Key:**
    On the first launch, the app will prompt you to enter your Google Gemini API key. Paste your key into the modal to enable the app's features.

---

## Deployment

This project is configured for easy deployment on a static hosting service like Netlify, directly from your GitHub repository.

1.  **Push to your GitHub Repository:**
    Make sure your latest code is pushed to your main branch on GitHub.

2.  **Deploy from Netlify:**
    - Go to [Netlify](https://www.netlify.com/) and sign up or log in.
    - Click "Add new site" -> "Import an existing project".
    - Connect to GitHub and authorize Netlify.
    - Select your `UrbanSenseAI` repository.
    - Netlify will detect it's a static site. You do not need a build command or publish directory. Just click "Deploy site".
    - Netlify will provide you with a live URL. **Remember to update the "Live Demo" link at the top of this README!**

## Installing as a PWA on Your Phone

Once deployed, you can install UrbanSenseAI on your phone for the best experience.

1.  Open the live Netlify URL in the browser on your phone (Chrome for Android, Safari for iOS).
2.  Set your API key when prompted.
3.  Follow the on-screen prompt or browser menu option to **"Install App"** or **"Add to Home Screen"**.
4.  Launch the app from its new icon on your home screen.

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
