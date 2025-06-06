export declare const forgotPassword: (email: string) => Promise<void>;
export declare const resetPassword: (userId: string, rawToken: string, newPassword: string) => Promise<void>;
export declare const changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>;
