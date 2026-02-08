import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

/**
 * Uploads a file to Firebase Storage
 * @param {string} uri - Local file URI
 * @param {string} path - Storage path (e.g., 'students/123/profile.jpg')
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (uri, path) => {
    if (!uri) return null;

    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, path);
        const result = await uploadBytes(storageRef, blob);

        // We're done with the blob, close it if on native
        if (blob.close) {
            blob.close();
        }

        const url = await getDownloadURL(result.ref);
        return url;
    } catch (error) {
        console.error("Error uploading file:", error);
        if (error.code === 'storage/unauthorized') {
            throw new Error("Permission denied: Check your Storage Rules in Firebase Console.");
        } else if (error.message.includes('network') || error.message.includes('CORS')) {
            throw new Error("Network/CORS Error: Please configure CORS for your Firebase Storage bucket (see cors.json).");
        }
        throw error;
    }
};
