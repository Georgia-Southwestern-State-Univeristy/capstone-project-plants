Verdure AI  

Project Description 

Verdure AI is a chatbot that is able to have plant-related conversations with the user and analyze uploaded images of plants for analysis.  

Users will be able to communicate with Verdure to get quick and easy solutions for plantcare. They will be able to upload images for Verdure to analyze and identify different plant species and their conditions. 

Installation and setup instructions 

Here are comprehensive setup instructions for the Verdure AI plant care application: 

Prerequisites Setup: 

Install Node.js and npm 

Go to Node.js website 

Download and install the LTS (Long Term Support) version 

Verify installation in terminal/command prompt:
node --version 
npm --version 
  

Install Git 

Download and install from Git website 

Verify installation:
git --version 
  

Install Redis 

Download and install Redis for your operating system 

Start Redis service following your OS instructions 

Main Application Setup: 

Download and extract the project files to your desired location 

Environment Configuration: 

Create a new file named .env in the root folder 

Add the following required credentials (get these from your project administrators): 

Firebase configuration 

Google Cloud Vision API keys 

Perenual API key 

Redis configuration 

Google OAuth credentials 

Open terminal/command prompt and navigate to project folder: 

cd [to wherever you extracted the files] 
  

Install dependencies: 

npm install 
  

This may take several minutes 

If you get permissions errors: 

Windows: Run terminal as administrator 

Mac/Linux: Use sudo npm install 

Run the linter to check code: 

npm run lint 
  

Fix any errors if they appear 

 

Build the application: 

npm run build 
  

This creates production files 

Check for any build errors 

 

Start the application: 

npm run serve 
  

For development mode OR npm start 

For production mode 

 

Access the application: 

Open your web browser 

Go to: http://localhost:[your-port-number] 

You should see the Verdure AI landing page 

Verification Steps: 

Check that you can: 

View the landing page 

Register/login 

Access the chat interface 

Upload images 

Receive AI responses 

Troubleshooting: 

If dependencies fail to install:npm cache clean --force 
npm install 
  

If Redis connection fails: 

Verify Redis is running 

Check .env configuration 

If build fails: 

Check Node.js version compatibility 

Verify all environment variables are set 

If Firebase fails: 

Verify Firebase credentials in .env 

Check Firebase console for service status 

Additional Notes: 

Keep your .env file secure and never commit it to version control 

Regular npm updates may be required:
npm update 
  

For development, use npm run serve to get hot-reload features 

For production, use npm start to run the optimized build 

Required Services: 

Firebase account for authentication and database 

Google Cloud Vision API for image analysis 

Redis server for caching 

Google OAuth for authentication 

These instructions assume no prior experience with Vue.js or npm and should get you started with the Verdure AI application. Contact project administrators if you need specific API keys or credentials. 

Contributor Guidelines 

Based on the project documents and understanding that this is a Verdure AI Capstone project focused on plant care assistance, here's a comprehensive contributor guideline: 

Contributors should: 

Follow Vue.js best practices when working with components, including proper component organization and using composition API as demonstrated in the existing codebase. 

Maintain the established color scheme (primary colors #072d13 for dark green and #341c02 for brown) and design aesthetic throughout new UI components. 

Use ESLint for code formatting and follow the existing ESLint configuration. The project uses plugin:vue/vue3-essential and eslint:recommended as shown in .eslintrc.js. 

Handle errors appropriately using the established error handling patterns, including proper logging through the logger service and user notifications through the useNotifications composable. 

Follow the existing authentication patterns when working with Firebase, including proper error handling and user state management through Vuex. 

Write code that is responsive and accessible, following the project's commitment to ADA compliance as mentioned in the project proposal. 

Use Bootstrap 5 for styling and components, maintaining consistency with the existing responsive design patterns. 

Implement proper API error handling and loading states for all asynchronous operations. 

When working with the AI features, utilize the established services in the ai.js file and follow the caching patterns using Redis. 

Maintain environment variable security by never committing sensitive credentials and following the .gitignore patterns. 

Test all features across different screen sizes as the application is designed to be responsive and mobile-friendly. 

These guidelines ensure consistency with the existing codebase while maintaining the project's goals of providing an accessible and efficient plant care assistant. 

Customize configuration 

See Configuration Reference for Vue.js CLI.
