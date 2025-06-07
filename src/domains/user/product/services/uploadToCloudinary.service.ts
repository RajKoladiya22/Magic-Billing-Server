import cloudinary from '../../../../core/utils/cloudnary';
import { sendSuccessResponse,sendErrorResponse } from '../../../../core/utils/httpResponse';
import { UploadApiResponse } from 'cloudinary';

export const uploadToCloudinary = async (path: string): Promise<UploadApiResponse> => {
    try {
        const result = await cloudinary.uploader.upload(path, {
            folder: 'magicBilling/products',
        });
        return result;
    } catch (err) {
        throw err;
    }
};

export const deleteFromCloudinary = async (imagePublicId: string): Promise<UploadApiResponse> => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId, {
        });
        return result;
    } catch (err) {
        throw err;
    }
};

// export default uploadToCloudinary;
