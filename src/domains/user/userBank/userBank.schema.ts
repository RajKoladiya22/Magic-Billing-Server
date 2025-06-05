import { z } from 'zod';

export const createUserBankSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().min(6),
  ifscCode: z.string().optional(),
  branch: z.string().optional(),
  accountType: z.string().optional(),
  openingBalance: z.number().optional(),
  upiId: z.string().optional(),
  notes: z.array(z.string()).optional(),
  isDefault: z.boolean().optional()
});
