// services/ai.js
import { Storage } from '@google-cloud/storage';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

const storage = new Storage();
const bucket = storage.bucket(process.env.VUE_APP_GCP_BUCKET);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.VUE_APP_OPENAI_API_KEY,
  })
);

export const analyzeImage = async (imageFile) => {
  // Upload to GCS
  const blob = bucket.file(imageFile.name);
  await blob.save(imageFile);
  const [url] = await blob.getSignedUrl({ action: 'read', expires: '03-01-2500' });

  // Call AI model endpoint
  const response = await axios.post(process.env.VUE_APP_AI_ENDPOINT, {
    image_url: url
  });

  return response.data;
};

export const getPlantCareAdvice = async (plantInfo) => {
  const completion = await openai.createCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a plant care expert providing advice about plant care and maintenance."
      },
      {
        role: "user",
        content: `Provide care advice for: ${plantInfo}`
      }
    ]
  });

  return completion.data.choices[0].message.content;
};