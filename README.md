## Verdure AI

## Project Description

Verdure AI is a chatbot that is able to have plant-related conversations with the user 
and analyze uploaded images of plants for analysis. 

Users will be able to communicate with Verdure to get quick and easy solutions for
plantcare. They will be able to upload images for Verdure
to analyze and identify different plant species and their conditions.

## Installation and setup instructions

Download and go through the setup procedures for Node.js. 

Download zipped folder that contains the Verdure AI Vue application, and its
corresponding backend information.

Extract information from zipped folder from within your Downloads folder.
Proceed to your Windows Powershell terminal and navigate to the Vue app folder
where Verdure AI resides. Once you are inside the folder that
contains the Vue files, utilize this instruction which installs the 
Node Package Manager.

```
npm install
```
Do this command for further configuration.

```
npm run lint
```

Use this command to build the application.

```
npm run build
```

Then do this command to have the app run on your local host.

```
npm run start
```

Navigate to your local host to interact with Verdure AI. 

### Contributor Guidelines
Based on the project documents and understanding that this is a Verdure AI Capstone project focused on plant care assistance, here's a comprehensive contributor guideline:

Contributors should:

1. Follow Vue.js best practices when working with components, including proper component organization and using composition API as demonstrated in the existing codebase.

2. Maintain the established color scheme (primary colors #072d13 for dark green and #341c02 for brown) and design aesthetic throughout new UI components.

3. Use ESLint for code formatting and follow the existing ESLint configuration. The project uses `plugin:vue/vue3-essential` and `eslint:recommended` as shown in `.eslintrc.js`.

4. Handle errors appropriately using the established error handling patterns, including proper logging through the `logger` service and user notifications through the `useNotifications` composable.

5. Follow the existing authentication patterns when working with Firebase, including proper error handling and user state management through Vuex.

6. Write code that is responsive and accessible, following the project's commitment to ADA compliance as mentioned in the project proposal.

7. Use Bootstrap 5 for styling and components, maintaining consistency with the existing responsive design patterns.

8. Implement proper API error handling and loading states for all asynchronous operations.

9. When working with the AI features, utilize the established services in the `ai.js` file and follow the caching patterns using Redis.

10. Maintain environment variable security by never committing sensitive credentials and following the `.gitignore` patterns.

11. Test all features across different screen sizes as the application is designed to be responsive and mobile-friendly.

These guidelines ensure consistency with the existing codebase while maintaining the project's goals of providing an accessible and efficient plant care assistant.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


