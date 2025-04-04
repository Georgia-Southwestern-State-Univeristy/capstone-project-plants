// import axios from 'axios';

// export const logError = async (error) => {
//     console.error(error); // Log to console as well
//     return axios.post('/api/log/error', { error });
// };

// export const logInfo = async (message) => {
//     console.log(message); // Log to console as well
//     return axios.post('/api/log/info', { message });
// };

export const logger = {
    async logError(error) {
      console.error("Logging Error:", error);
    },
  
    async logInfo(message) {
      console.log("Logging Info:", message);
    }
  };
  