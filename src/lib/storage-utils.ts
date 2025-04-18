import { createClient } from "../../supabase/client";

const STORAGE_BUCKET = 'session-images'; // The Supabase Storage bucket name

/**
 * Uploads an image file to Supabase Storage.
 * @param file The file to upload
 * @param sessionId The session ID to associate with this file
 * @returns Object containing { path, url } if successful, or { error } if upload fails
 */
export async function uploadSessionImage(
  file: File,
  sessionId: string
): Promise<{ path?: string; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop(); // Get file extension
    const fileName = `${sessionId}/${Date.now()}.${fileExt}`;
    const filePath = `${sessionId}/${fileName}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return { error: error.message };
    }
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);
    
    return {
      path: data.path,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return { error: 'Failed to upload image. Please try again.' };
  }
}

/**
 * Upload multiple image files for a session
 * @param files Array of files to upload
 * @param sessionId The session ID to associate with these files
 * @returns Object containing uploads array with results and error count
 */
export async function uploadSessionImages(
  files: File[],
  sessionId: string
): Promise<{
  uploads: { path?: string; url?: string; error?: string }[];
  errorCount: number;
}> {
  const results = await Promise.all(
    Array.from(files).map((file) => uploadSessionImage(file, sessionId))
  );
  
  const errorCount = results.filter((result) => result.error).length;
  
  return {
    uploads: results,
    errorCount,
  };
}

/**
 * Creates a session image record in the database
 * @param sessionId The session ID
 * @param path The storage path of the image
 * @param url The public URL of the image
 */
export async function createSessionImageRecord(
  sessionId: string,
  path: string,
  url: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('session_images')
      .insert({
        session_id: sessionId,
        storage_path: path,
        url: url,
      });
    
    if (error) {
      console.error('Error creating image record:', error);
      return { error: error.message };
    }
    
    return {};
  } catch (error) {
    console.error('Unexpected error creating image record:', error);
    return { error: 'Failed to save image information.' };
  }
}

/**
 * Get all images for a specific session
 * @param sessionId The session ID to get images for
 * @returns Array of image objects or error
 */
export async function getSessionImages(
  sessionId: string
): Promise<{ images?: any[]; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('session_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { error: error.message };
    }
    
    return { images: data };
  } catch (error) {
    console.error('Error fetching session images:', error);
    return { error: 'Failed to fetch session images.' };
  }
}

/**
 * Delete an image from storage and the database
 * @param imageId The database ID of the image
 * @param storagePath The storage path of the image
 */
export async function deleteSessionImage(
  imageId: string,
  storagePath: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    
    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);
    
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return { error: storageError.message };
    }
    
    // Then delete the database record
    const { error: dbError } = await supabase
      .from('session_images')
      .delete()
      .eq('id', imageId);
    
    if (dbError) {
      console.error('Error deleting image record:', dbError);
      return { error: dbError.message };
    }
    
    return {};
  } catch (error) {
    console.error('Unexpected error deleting image:', error);
    return { error: 'Failed to delete image.' };
  }
} 