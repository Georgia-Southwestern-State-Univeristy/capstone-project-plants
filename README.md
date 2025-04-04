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

- **Frontend**: Vue.js 3, Pinia (state management), Bootstrap 5
- **Backend**: Node.js, Express
- **AI Services**: Google Vision API, Google Gemini API
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Caching**: Redis
- **Authentication**: Firebase Authentication

## Installation and Setup

### Prerequisites

Before installing Verdure AI, ensure you have the following installed:

- Node.js (v22 or higher)
- npm (Usually comes with Node.js)
- Git

### Step-by-Step Installation Guide

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

Create a `.env` file in the root directory with the following variables:

```
# Firebase Configuration
VITE_APP_FIREBASE_API_KEY=your_firebase_api_key
VITE_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_APP_FIREBASE_APP_ID=your_firebase_app_id

# Google API Keys
VITE_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_google_service_account_key.json

VITE_APP_GOOGLE_CLOUD_PROJECT=value_for_variable
VITE_APP_GOOGLE_APPLICATION_CREDENTIALS=value_for_variable
VITE_APP_GCP_BUCKET=value_for_variable
VITE_APP_GOOGLE_API_KEY=value_for_variable
VITE_APP_VISION_API_KEY=value_for_variable

# Perenual API (Plant Database)
VITE_APP_PERENUAL_API_KEY=your_perenual_api_key

# Redis Configuration
VITE_APP_REDIS_HOST=your_redis_host
VITE_APP_REDIS_PORT=your_redis_port
VITE_APP_REDIS_NAME=your_redis_username
VITE_APP_REDIS_PASSWORD=your_redis_password

# App URL
VITE_APP_API_URL=http://localhost:8082
```

4. **Set Up Google Service Account**

- Create a `secrets` folder in the project root
- Save your Google Service Account key as `googleServiceAccKey.json` in the secrets folder
- Ensure the path in `GOOGLE_APPLICATION_CREDENTIALS` points to this file

5. **Start the Development Servers**

Start the backend server:
```bash
node server/vueServer.js
```

In a separate terminal, start the frontend:
```bash
npm run dev
```

6. **Access the Application**

- Frontend: http://localhost:8082
- Backend API: http://localhost:5000

## External Service Setup

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Email/Password and Google sign-in
3. Create a Firestore database
4. Set up Firebase Storage
5. Generate a service account key for the server
6. Update your `.env` file with the Firebase credentials

### Google Vision API

1. Enable the Google Vision API in your Google Cloud Console
2. Ensure your service account has access to the Vision API
3. Add the API key to your `.env` file

### Google Gemini API

1. Sign up for a Gemini API key at [ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key)
2. Add the API key to your `.env` file

### Perenual API

1. Sign up for a Perenual API key at [perenual.com](https://perenual.com)
2. Add the API key to your `.env` file

### Redis Setup

1. Sign up for Redis at [redis.io](https://redis.io)
2. Add Redis credentials to your `.env` file

## User Guide

### Authentication

- **Registration**: Create a new account with email and password
- **Login**: Access your account using credentials
- **Password Reset**: Reset your password via email

### Plant Identification

1. Navigate to the Chat page
2. Click the paperclip icon to upload a plant image
3. Optionally add a message describing your plant or asking a question
4. Click the send button to process the image
5. View the AI-generated plant details

### Plant Gallery

1. From the Chat page, when a plant is identified, click "Add plant to collection"
2. Navigate to the Plant Gallery to view your saved plants
3. Click on a plant card to view detailed information
4. Use the edit or delete options to manage your plants

### User Profile

1. Access your profile via the account icon
2. Edit your profile information
3. Change your password
4. Upload a profile picture

## Troubleshooting

### Firebase Authentication Issues

- Verify that you've enabled proper authentication methods in Firebase console
- Check that your Firebase configuration in the `.env` file is correct

### Google Vision API Issues

- Ensure the Google Vision API is enabled in your Google Cloud Console
- Verify your service account key has the necessary permissions
- Check the `GOOGLE_APPLICATION_CREDENTIALS` path is correct

### Redis Connection Issues

- Verify your Redis credentials in the `.env` file
- Ensure your Redis instance is running and accessible

### Server Connection Issues

- Ensure the backend server is running on port 5000
- Check for CORS issues in the console
- Verify the proxy settings in `vite.config.js` are correct

## API Documentation

### Authentication API

#### Register User
- **Endpoint**: `/api/auth/register`
- **Method**: POST
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```
- **Response**: User object with success flag

#### Login User
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: User object with success flag

#### Reset Password
- **Endpoint**: `/api/auth/reset-password`
- **Method**: POST
- **Body**: 
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: Success message

### Chat API

#### Send Message with Image
- **Endpoint**: `/api/chat/chat`
- **Method**: POST
- **Body**: FormData with `message`, `image` (file), and `idToken`
- **Response**: AI response with optional image URL

#### Add Plant to Collection
- **Endpoint**: `/api/chat/add-plant`
- **Method**: POST
- **Body**: FormData with `aiResponse` (JSON), `idToken`, and optional `image`
- **Response**: Plant details with success flag

#### Get Last Chat
- **Endpoint**: `/api/chat/get-last-chat`
- **Method**: GET
- **Query**: `userId`
- **Response**: Last AI response

### Plant API

#### Get Plant from Perenual API
- **Endpoint**: `/plants/perenual/:plantId`
- **Method**: GET
- **Response**: Plant details from Perenual API

#### Get User Plants
- **Endpoint**: `/plants/users/:userId/plants`
- **Method**: GET
- **Response**: Array of user plants

#### Add New Plant
- **Endpoint**: `/plants/users/:userId/plants`
- **Method**: POST
- **Body**:
  ```json
  {
    "name": "Plant Name",
    "type": "Plant Type",
    "wateringSchedule": "Every 7 days",
    "lastWatered": "2025-04-01",
    "healthStatus": "Healthy"
  }
  ```
- **Response**: Success flag with plant ID

## Contributing

### Contributor Guidelines

1. Follow Vue.js best practices for component organization
2. Maintain the established color scheme and design aesthetic
3. Handle errors using the established error handling patterns
4. Follow existing authentication patterns for Firebase integration
5. Write responsive and accessible code for ADA compliance
6. Use Bootstrap 5 for consistent styling and components
7. Implement proper API error handling and loading states
8. Use established AI service integration patterns
9. Maintain environment variable security
10. Follow the project's Git workflow

## License

This project is proprietary and confidential. Unauthorized use, distribution, or modification is prohibited.
