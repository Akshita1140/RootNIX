import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//file upload

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: 'rootnix',
            resource_type: 'auto'
        })
        console.log("File uploaded to Cloudinary successfully", response.url);
        return response.secure_url;
    }

    catch (err) {
        fs.unlinkSync(localFilePath);
        console.error("Error uploading file to Cloudinary", err);
        return null;
    }
}

export {cloudinary}
export { uploadOnCloudinary }

