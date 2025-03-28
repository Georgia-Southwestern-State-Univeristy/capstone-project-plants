import { storage } from "../utils/firebaseAdmin.js";
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
// import { logger } from './logging'

// export const uploadImage = async (file) => {
//   try {
//     // Create a unique filename using timestamp
//     const storageRef = ref(storage, `plant-images/${Date.now()}_${file.name}`)
    
//     // Upload the file
//     await uploadBytes(storageRef, file)
    
//     // Get the download URL
//     const imageUrl = await getDownloadURL(storageRef)
    
//     logger.logInfo('Image uploaded successfully', { filename: file.name })
    
//     return imageUrl
//   } catch (error) {
//     logger.logError('Error uploading image:', error)
//     throw new Error('Failed to upload image: ' + error.message)
//   }
// }


/**
 * Uploads a file buffer to Firebase Storage and returns a public download URL.
 *
 * @param {Buffer} buffer - The image file buffer (e.g. from multer)
 * @param {string} mimeType - The content type (e.g. "image/jpeg")
 * @param {string} userId - The Firebase user ID
 * @returns {Promise<string>} - The public image URL
 */
export const uploadImageToStorage = async (buffer, mimeType, userId) => {
  try {
    const bucket = storage.bucket();
    const fileName = `users/${userId}/uploads/${Date.now()}_plant.jpg`;
    const file = bucket.file(fileName);

    // Save the file
    await file.save(buffer, {
      contentType: mimeType,
      public: false, // we construct our own Firebase-style URL
    });

    // Encode the path for URL
    const encodedPath = encodeURIComponent(file.name);

    // Return Firebase-style public image URL
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media`;

    return imageUrl;
  } catch (error) {
    console.error("❌ Failed to upload image to Firebase:", error);
    throw error;
  }
};
