import { Prisma } from "@prisma/client";

export interface IUserDetailInput {
  companyName?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  businessEmail?: string | null;
  phoneNumber?: string | null;
  alternativePhoneNumber?: string | null;
  website?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  signatureImages?: any;
}


export interface IUserDetail extends IUserDetailInput {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
