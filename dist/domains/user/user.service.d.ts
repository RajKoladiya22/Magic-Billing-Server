import { User } from "./user.model";
export declare function sendOtp(email: string): Promise<void>;
export declare function verifyOtp(email: string, code: string): Promise<void>;
interface SignupInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export declare function signupUser(input: SignupInput): Promise<User>;
interface SigninInput {
    email: string;
    password: string;
}
export declare function signinUser(input: SigninInput): Promise<User>;
export {};
