const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async(file, folder, height, quality) => {
    //yaha par hum jo bhi files bhejenge voh folder ke andar upload kar dega
    const options = {folder};

    if(height){
        options.height = height
    }

    if(quality){
        options.quality = quality
    }

    options.resource_type = 'auto'

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}