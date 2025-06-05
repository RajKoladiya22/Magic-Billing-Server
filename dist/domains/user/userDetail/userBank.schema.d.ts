import { z } from 'zod';
export declare const createUserBankSchema: z.ZodObject<{
    bankName: z.ZodString;
    accountNumber: z.ZodString;
    ifscCode: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    accountType: z.ZodOptional<z.ZodString>;
    openingBalance: z.ZodOptional<z.ZodNumber>;
    upiId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    bankName: string;
    accountNumber: string;
    ifscCode?: string | undefined;
    branch?: string | undefined;
    accountType?: string | undefined;
    openingBalance?: number | undefined;
    upiId?: string | undefined;
    notes?: string[] | undefined;
    isDefault?: boolean | undefined;
}, {
    bankName: string;
    accountNumber: string;
    ifscCode?: string | undefined;
    branch?: string | undefined;
    accountType?: string | undefined;
    openingBalance?: number | undefined;
    upiId?: string | undefined;
    notes?: string[] | undefined;
    isDefault?: boolean | undefined;
}>;
