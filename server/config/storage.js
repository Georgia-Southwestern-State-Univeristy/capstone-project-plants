import { storage } from "./firebaseAdmin.js";

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
