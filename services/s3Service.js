const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Generate a presigned URL that the client will use to upload the video directly to S3
 * Includes strict validation for AWS constraints mapped to the platform's requirements.
 * @param {string} fileName - Original file name or generated UUID + extension
 * @param {string} contentType - mime type of the video (e.g. video/mp4)
 * @param {number} fileSize - size of the file in bytes
 * @returns {Promise<{uploadUrl: string, fileKey: string}>}
 */
exports.generateUploadUrl = async (fileName, contentType, fileSize) => {
    // 100MB Size Limit Validation (100 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 104857600;
    if (fileSize && fileSize > MAX_FILE_SIZE) {
        throw new Error('File exceeds maximum allowed size of 100MB.');
    }

    // Content-Type Validation
    const validTypes = ['video/mp4', 'video/x-m4v', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(contentType)) {
        throw new Error('Invalid video format. Must be mp4, webm, or mov.');
    }

    const fileKey = `videos/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: contentType,
    });

    try {
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
        return {
            uploadUrl,
            fileKey, // Used to construct the final access URL later
            finalUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
        };
    } catch (err) {
        console.error('Error generating S3 presigned URL', err);
        throw new Error('Failed to generate upload URL');
    }
};
