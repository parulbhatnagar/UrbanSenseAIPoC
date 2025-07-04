
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
- **Simplified Setup**: Uses a hardcoded API key for quick and easy local development.

---

## Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: TailwindCSS (via CDN)
- **AI**: Google Gemini API (`@google/genai`)
- **Web APIs**: WebRTC (getUserMedia), Web Speech API (SpeechRecognition, SpeechSynthesis)
- **PWA**: Service Workers, Web App Manifest
- **Hosting**: Netlify

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and npm (which comes with Node.js) installed on your computer.

You will also need a **Google Gemini API Key**. You can obtain one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Configuration

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/parulbhatnagar/UrbanSenseAIPoC.git
    cd UrbanSenseAIPoC
    ```

2.  **Add your API Key:**
    - Open the file `services/geminiService.ts`.
    - Find the line `const API_KEY = "YOUR_API_KEY_HERE";`.
    - Replace `"YOUR_API_KEY_HERE"` with your actual Google Gemini API key.

    > **Security Warning**: Hardcoding API keys in your client-side source code is insecure and not recommended for production applications. Anyone who can access your site's files can find your key. For personal use or testing, this method is straightforward.

### Local Setup & Running

**Important**: This web application cannot be run by simply opening the `index.html` file in a browser due to security restrictions (`file://` protocol). It must be served by a web server.

1.  **Install a local server:**
    We will use `serve`, a simple static server. Open your terminal or command prompt and run:
    ```sh
    npm install -g serve
    ```

2.  **Start the server:**
    From your project's root directory, run:
    ```sh
    serve
    ```

3.  **Access the application:**
    The terminal will show you a "Local" address, typically `http://localhost:3000`. Open this URL in your web browser. The app should now be running.

---

## Deployment

This project can be deployed on a static hosting service like Netlify, Vercel, or GitHub Pages.

**Critical Security Warning**: Since your API key is hardcoded in the source code, anyone who can access your deployed site's source files **will be able to see and use your API key**. This can lead to unexpected charges on your Google Cloud bill. Deploy public-facing sites with extreme caution and consider securing your key.

### Critical Deployment Step: The `_redirects` file

**This file is required to fix the "Page Not Found" error on Netlify.**

This project is a Single Page Application (SPA). The included `_redirects` file contains a rewrite rule that tells Netlify to serve `index.html` for all routes, allowing the React app to handle routing internally.

### Deployment Instructions

1.  **Push to your GitHub Repository:**
    Make sure your latest code, with your API key included, is pushed to your GitHub repository.

2.  **Deploy from a static hosting provider (e.g., Netlify):**
    - Go to your provider, sign up or log in.
    - Connect your GitHub account and select your repository.
    - The build settings can usually be left as default. There is **no need to set environment variables** for the API key.
    - Deploy the site.

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
