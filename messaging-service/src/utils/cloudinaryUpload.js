import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = async (fileBuffer, fileName, folder = 'messages') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder,
        // public_id: fileName.split('.')[0],
        public_id: fileName,
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};