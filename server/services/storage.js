import { storage } from "../utils/firebase.js";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { logger } from './logging'

export const uploadImage = async (file) => {
  try {
    // Create a unique filename using timestamp
    const storageRef = ref(storage, `plant-images/${Date.now()}_${file.name}`)
    
    // Upload the file
    await uploadBytes(storageRef, file)
    
    // Get the download URL
    const imageUrl = await getDownloadURL(storageRef)
    
    logger.logInfo('Image uploaded successfully', { filename: file.name })
    
    return imageUrl
  } catch (error) {
    logger.logError('Error uploading image:', error)
    throw new Error('Failed to upload image: ' + error.message)
  }
}