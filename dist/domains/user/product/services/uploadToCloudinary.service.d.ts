import { UploadApiResponse } from 'cloudinary';
export declare const uploadToCloudinary: (path: string) => Promise<UploadApiResponse>;
export declare const deleteFromCloudinary: (imagePublicId: string) => Promise<UploadApiResponse>;
