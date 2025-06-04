import { User } from "./user.model";
import { IUser, SignupInput, SigninInput } from "../../../../interfaces/auth.interfaces";
export declare const sendOtp: (email: string) => Promise<void>;
export declare const verifyOtp: (email: string, code: string) => Promise<void>;
export declare const signupUser: (input: SignupInput) => Promise<IUser>;
export declare const signinUser: (input: SigninInput) => Promise<User>;
