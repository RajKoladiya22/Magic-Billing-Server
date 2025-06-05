// controllers/userBank.controller.ts
import { Request, Response } from "express";
import {
  createUserBank,
  getUserBanks,
  // getUserBankById,
  updateUserBank,
  deleteUserBank,
} from "./userBank.service";
import { createUserBankSchema } from "./userBank.schema";

export const createHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const parsed = createUserBankSchema.safeParse(req.body);
    const bank = await createUserBank(userId, parsed);
    res.status(201).json({ success: true, bank });
  } catch (error) {}
};

export const listHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const banks = await getUserBanks(userId);
  res.json({ success: true, banks });
};

export const detailHandler = async (req: Request, res: Response) => {
  const bank = await getUserBankById(req.params.id, req.user?.id);
  if (!bank) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, bank });
};

export const updateHandler = async (req: Request, res: Response) => {
  const updated = await updateUserBank(req.params.id, req.user?.id, req.body);
  res.json({ success: true, bank: updated });
};

export const deleteHandler = async (req: Request, res: Response) => {
  await deleteUserBank(req.params.id, req.user?.id);
  res.status(204).send();
};
