const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a video file from disk to Cloudinary.
 * @param {string} filePath - The path to the temporary video file stored by multer.
 * @param {string} originalName - Original filename.
 * @returns {Promise<{secure_url: string, public_id: string, duration: number, thumbnail_url: string}>}
 */
exports.uploadVideoToCloudinary = async (filePath, originalName) => {
  try {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId = `edulearn/videos/${Date.now()}-${safeName}`;

    console.log('DEBUG: Uploading to Cloudinary with public_id:', publicId);

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      public_id: publicId,
      folder: 'edulearn_videos' // as requested in the task prompt
    });

    console.log('DEBUG: Cloudinary upload success', result.public_id);

    // Generate a thumbnail URL by changing the video extension to .jpg
    const formatRegex = /\.[^/.]+$/;
    const thumbnail_url = result.secure_url.replace(formatRegex, '.jpg');

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration || 0,
      thumbnail_url,
    };
  } catch (error) {
    console.error('DEBUG: Cloudinary upload error', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a video from Cloudinary by public_id.
 */
exports.deleteFromCloudinary = async (publicId) => {
  try {
    console.log('DEBUG: Attempting to delete from Cloudinary', publicId);
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log('DEBUG: Cloudinary delete success', publicId);
  } catch (err) {
    console.error('Cloudinary delete error (non-critical):', err.message);
  }
};