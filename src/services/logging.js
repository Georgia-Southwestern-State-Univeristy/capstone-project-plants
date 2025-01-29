import { Logging } from '@google-cloud/logging';

const logging = new Logging({
 projectId: process.env.GOOGLE_CLOUD_PROJECT
});

export const logger = {
 async logError(error) {
   const log = logging.log('errors');
   const metadata = {
     severity: 'ERROR',
     resource: {
       type: 'global'
     }
   };
   await log.write(log.entry(metadata, error));
 },

 async logInfo(message) {
   const log = logging.log('app');
   const metadata = {
     severity: 'INFO', 
     resource: {
       type: 'global'
     }
   };
   await log.write(log.entry(metadata, message));
 }
};