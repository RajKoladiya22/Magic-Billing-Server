// services/userBank.service.ts
import { log } from "console";
import { prisma } from "../../../config/database.config";
import { encrypt, decrypt } from "../../../core/utils/crypto";
import { UserBank } from "@prisma/client";

export async function createUserBank(userId: string, data: any) {
  // console.log("createUserBank called with data:", data);
  // console.log("userId:", userId);
  console.log("\n\n\n CHECK---->", encrypt(data.accountNumber));
  
  const encrypted = {
    ...data,
    accountNumber: encrypt(data.accountNumber),
    ifscCode: data.ifscCode ? encrypt(data.ifscCode) : undefined,
    upiId: data.upiId ? encrypt(data.upiId) : undefined,
  };
  console.log("\n\n\n encrypted--->", encrypted);
  return prisma.userBank.create({ data: { ...encrypted, userId } });
}

export async function getUserBanks(userId: string) {
  const banks = await prisma.userBank.findMany({ where: { userId } });
  return banks.map(b => ({
    ...b,
    accountNumber: decrypt(b.accountNumber),
    ifscCode: b.ifscCode ? decrypt(b.ifscCode) : null,
    upiId: b.upiId ? decrypt(b.upiId) : null,
  }));
}

export const getUserBankById = async (id: string, userId: string): Promise<UserBank | null> => {
  const bank = await prisma.userBank.findFirst({ where: { id, userId } });
  if (!bank) throw new Error('Not found');
  
  return {
    ...bank,
    accountNumber: bank.accountNumber? decrypt(bank.accountNumber) : '',
    ifscCode: bank.ifscCode ? decrypt(bank.ifscCode) : null,
    upiId: bank.upiId ? decrypt(bank.upiId) : null,
  };
};

export async function updateUserBank(userId: string, id: string, data: any) {
  const bank = await prisma.userBank.findUnique({ where: { id } });
  if (!bank || bank.userId !== userId) throw new Error('Unauthorized');

  const encrypted = {
    ...data,
    accountNumber: data.accountNumber ? encrypt(data.accountNumber) : undefined,
    ifscCode: data.ifscCode ? encrypt(data.ifscCode) : undefined,
    upiId: data.upiId ? encrypt(data.upiId) : undefined,
  };

  return prisma.userBank.update({ where: { id }, data: encrypted });
}

export async function deleteUserBank(userId: string, id: string) {
  const bank = await prisma.userBank.findUnique({ where: { id } });
  if (!bank || bank.userId !== userId) throw new Error('Unauthorized');
  return prisma.userBank.delete({ where: { id } });
}
