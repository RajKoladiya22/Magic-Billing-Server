export interface SendOtpRequestBody {
    email: string;
}
export interface VerifyOtpRequestBody {
    email: string;
    code: string;
}
export interface SignupRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export interface SigninRequestBody {
    email: string;
    password: string;
}
export interface IUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "USER" | "ADMIN" | "superadmin";
    isActive: boolean;
    isVerified: boolean;
}
export interface SignupInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export interface SigninInput {
    email: string;
    password: string;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}
