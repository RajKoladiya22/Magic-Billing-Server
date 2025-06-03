export interface IUserDetailInput {
    companyName?: string;
    gstNumber?: string;
    panNumber?: string;
    businessEmail?: string;
    phoneNumber?: string;
    alternativePhoneNumber?: string;
    website?: string;
    billingAddress?: Record<string, any>;
    shippingAddress?: Record<string, any>;
    signatureImages?: any[];
}
export interface IUserDetail extends IUserDetailInput {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
