const cloudinary = require('cloudinary').v2;

const uploadImage = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    
    uploadStream.end(buffer);
  });
};

module.exports = {
  uploadImage,
};
