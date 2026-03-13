require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('DEBUG: Cloudinary config', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***HIDDEN***' : 'MISSING'
});

// Use an absolute path to the file
const filePath = "C:/Users/sabes/OneDrive/Desktop/proj/backend/test.png";

cloudinary.uploader.upload(filePath, { folder: "edulearn/test" }, (error, result) => {
  if (error) {
    console.error("DEBUG: Upload failed", error);
  } else {
    console.log("DEBUG: Upload success", result);
  }
});