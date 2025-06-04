import { IUserDetailInput, IUserDetail } from "../../../interfaces/userDetail.interface";
export declare const upsertUserDetail: (userId: string, data: IUserDetailInput) => Promise<IUserDetail>;
export declare const getUserDetail: (userId: string) => Promise<IUserDetail | null>;
export declare const updateUserDetail: (userId: string, data: IUserDetailInput) => Promise<IUserDetail>;
