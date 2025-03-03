# **Verdure AI Updated README.md** 

## **Project Description**

- Verdure AI is a chatbot that is able to have plant-related conversations with the user and analyze uploaded images of plants for analysis.

- Users will be able to communicate with Verdure to get quick and easy solutions for plant care. They will be able to upload images for Verdure to analyze and identify different plant species and their conditions.

- They will be able to receive information about the plant image, like the common name, scientific name, family, origins, key identifying features, and much more.

## **Installation and setup instructions (Originally produced by Claude AI, edited by MaShayla)**

### ***Here are comprehensive setup instructions for the Verdure AI plant care application:***

**Overview**

Verdure AI is a plant care assistant web application that helps users identify plants through image recognition, get plant care advice, and manage their plant collection. The app uses technologies including Vue.js, Firebase, Google Vision API, and Redis.

**Prerequisites**

Before installing Verdure AI, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v22 or higher)
- [npm](https://www.npmjs.com/) (Usually comes with Node.js)
- [Git](https://git-scm.com/)

## **Step-by-Step Installation Guide**

### **1. Clone the Repository**

Open Windows PowerShell, and type the following:

```
git clone https://github.com/Georgia-Southwestern-State-Univeristy/capstone-project-plants.git
cd [the directory that you saved the project to]
```

### **2. Install Dependencies**

```
npm install
```

### **3. Set Up Environment Variables**

Create a .env file in the root directory of the project with the following variables:

```
# Firebase Configuration
VITE_APP_FIREBASE_API_KEY = your_firebase_api_key
VITE_APP_FIREBASE_AUTH_DOMAIN = your_firebase_auth_domain
VITE_APP_FIREBASE_PROJECT_ID = your_firebase_project_id
VITE_APP_FIREBASE_STORAGE_BUCKET = your_firebase_storage_bucket
VITE_APP_FIREBASE_MESSAGING_SENDER_ID = your_firebase_messaging_sender_id
VITE_APP_FIREBASE_APP_ID = your_firebase_app_id

# Google API Keys
VITE_APP_GOOGLE_OAUTH_CLIENT_ID = your_google_oauth_client_id
GEMINI_API_KEY = your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS = path_to_your_google_service_account_key.json

VITE_APP_GOOGLE_CLOUD_PROJECT = value_for_variable
VITE_APP_GOOGLE_APPLICATION_CREDENTIALS = value_for_variable
VITE_APP_GCP_BUCKET = value_for_variable
VITE_APP_GOOGLE_API_KEY = value_for_variable
VITE_APP_VISION_API_KEY = value_for_variable

# Perenual API (Plant Database)
VITE_APP_PERENUAL_API_KEY = your_perenual_api_key

# Redis Configuration
VITE_APP_REDIS_HOST = your_redis_host
VITE_APP_REDIS_PORT = your_redis_port
VITE_APP_REDIS_NAME = your_redis_username
VITE_APP_REDIS_PASSWORD = your_redis_password

# App URL
VITE_APP_API_URL= http:/localhost:8082
```

### **4. Set Up Firebase and other Google environment variables**

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up Firebase Storage
5. Generate a service account key (for the server)
6. Save the service account key as googleServiceAccKey.json in a folder named 'secrets' (the secrets folder will be in the project root) and the path to this file will be the value of the GOOGLE_APPLICATION_CREDENTIALS variable in the .env file
7. Acquire .env Google variable values (Google Cloud project name, GCP bucket URL, Google OAuth client ID, Google API key) mentioned in the .env variable list above and copy those variable values into your .env file

### **5. Set Up Google Vision API**

1. Enable the Google Vision API in your Google Cloud Console
2. Make sure your service account has access to the Vision API

### **6. Set Up Perenual API**

1. Sign up for a Perenual API key at [perenual.com](https://perenual.com/docs/api)
2. Add the API key to your .env file

### **7. Set up Gemini API**

1. Sign up for a Gemini API key at [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key)
2. Add the API key to your .env file

### **8. Set up Redis account** 

1. Sign up for Redis variable values at [https://redis.io/](https://redis.io/)
2. Add Redis variable values to your .env file

### **9. Start the Development Server in PowerShell**

```
# Start the backend server
node server/vueServer.js

# In a separate terminal, start the front-end
npm run dev
```

## **Running the Application**

After following the setup instructions above:

1. The frontend server will be running at: http://localhost:8082
2. The backend API server will be running at: http://localhost:5000

## **Troubleshooting Common Issues**

### **Firebase Authentication Issues**

If you encounter issues with Firebase authentication:

- Make sure you've enabled the proper authentication methods in your Firebase console
- Check that your Firebase configuration in the .env file is correct
- Ensure that you have proper security rules set up for Firestore and Storage

### **Google Vision API Issues**

If plant recognition isn't working:

- Verify that the Google Vision API is enabled in your Google Cloud Console
- Check that your service account key has the proper permissions
- Ensure the GOOGLE_APPLICATION_CREDENTIALS path is correct

### **Redis Connection Issues**

If you're experiencing caching issues:

- Check your Redis credentials in the .env file
- Ensure your Redis instance is running and accessible

### **Server Connection Issues**

If the frontend can't connect to the backend:

- Ensure the backend server is running on port 5000
- Check for any CORS issues in the console
- Verify that the proxy settings in vite.config.js are correct

## **Next Steps**

Once the application is set up, you can:

1. Register for an account
2. Upload pictures of your plants to identify them
3. Add plants to your collection
4. Chat with the AI to get plant care advice

If you're planning to deploy the application, additional steps will be needed to set up hosting and proper environment variables in your hosting environment.

***-- End of installation guide --***

## **Contributor Guidelines (Originally produced by Claude AI, edited by MaShayla)**

- Follow Vue.js best practices when working with components, including proper component organization.
- Maintain the established color scheme and design aesthetic throughout new UI components.
- Handle errors appropriately using the established error handling patterns, including proper logging through the logger service and user notifications through the useNotifications composable.
- Follow the existing authentication patterns when working with Firebase, including proper error handling and user state management through Pinia.
- Write code that is responsive and accessible, following the project's commitment to ADA compliance as mentioned in the project proposal.
- Use Bootstrap 5 for styling and components, maintaining consistency with the existing responsive design patterns.
- Implement proper API error handling and loading states for all asynchronous operations.
- When working with the AI features, utilize the established services within the project and follow the caching patterns using Redis.
- Maintain environment variable security by never committing sensitive credentials and following the .gitignore patterns.

## **Customize configuration**

See Configuration Reference for Vue.js CLI by visiting the Vue.js website.

