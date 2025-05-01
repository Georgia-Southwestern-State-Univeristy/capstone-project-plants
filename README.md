# Verdure AI

## Project Overview
Verdure AI is an intelligent plant care assistant web application that helps users identify plants through image recognition, get detailed plant care advice, and manage their personal plant collection. The application leverages artificial intelligence to provide accurate plant identification and personalized care recommendations.

### Key Features
- **Plant Identification**: Upload images of plants for AI-powered identification
- **Care Recommendations**: Get detailed care instructions for identified plants
- **Personal Plant Gallery**: Save and manage your plant collection
- **AI Chatbot**: Have plant-related conversations with an intelligent assistant
- **User Authentication**: Secure account management

### Technology Stack
- **Frontend**: Vue.js 3, Pinia, Bootstrap 5
- **Backend**: Node.js, Express
- **AI Services**: Google Vision API, Google Gemini API
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Authentication

## Installation and Setup

### Prerequisites
Make sure you have the following installed:
- Node.js (v22 or higher)
- npm
- Git

### Installation Guide
1. **Clone the Repository**
```bash
git clone https://github.com/Georgia-Southwestern-State-Univeristy/capstone-project-plants.git
cd capstone-project-plants
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment Variables**
Ensure your `.env` file includes Firebase and API keys. See `env.example` for required variables.

4. **Google Service Account**
- Create a `secrets` folder in the project root
- Add your `googleServiceAccKey.json` file inside it

5. **Start the Development Servers**
Start backend:
```bash
node server/vueServer.js
```
Start frontend:
```bash
npm run dev
```

6. **Access the App**
- Frontend: http://localhost:8082
- Backend API: http://localhost:5000

## Minimal External Setup

### Firebase
- Create a Firebase project
- Enable Email/Password & Google sign-in
- Set up Firestore and Firebase Storage
- Add service account key and credentials to `.env`

### Google APIs
- Enable Google Vision API and Gemini API
- Add respective API keys to `.env`

### Perenual API
- Get an API key at [perenual.com](https://perenual.com)
- Add key to `.env`

## User Guide

### Authentication
- Register and log in with email/password
- Reset password via email if needed

### Plant Identification
1. Go to the Chat page
2. Upload a plant image using the paperclip icon
3. Optionally add a message
4. Submit to get plant details from AI

### Plant Gallery
- Save identified plants to your collection
- View, edit, or delete saved plants

### User Profile
- Edit profile information
- Change password
- Upload profile picture

## API Documentation

API endpoints and schemas have been moved to [API.md](./API.md).

## License
This project is proprietary and confidential. Unauthorized use, distribution, or modification is prohibited.
