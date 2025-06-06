import { log } from "console";
import { prisma } from "../../../config/database.config";
import { NoteAndTerms } from "@prisma/client";
import { validate as isUUID } from 'uuid';

export async function createNoteAndTerms(userId: string, data: any): Promise<NoteAndTerms> {
  // Directly use Prisma to create a new NoteAndTerms with JSON fields
   if (!isUUID(userId)) {
    throw new Error('Invalid UUID format');
  }
  return prisma.noteAndTerms.create({
    data: { ...data, userId }
  });
}

export async function getNoteAndTerms(userId: string): Promise<NoteAndTerms[]> {
   if (!isUUID(userId)) {
    throw new Error('Invalid UUID format');
  }
  return prisma.noteAndTerms.findMany({ where: { userId } });
}

export async function getNoteAndTermsById(id: string, userId: string): Promise<NoteAndTerms | null> {
  if (!isUUID(id) || !isUUID(userId)) {
    throw new Error('Invalid UUID format');
  }
  const record = await prisma.noteAndTerms.findFirst({ where: { id, userId } });
  console.log(`Fetching NoteAndTerms by ID: ${id} for User ID: ${record}`);
  if (!record) throw new Error("Record not found");
  return record;
}

export async function updateNoteAndTerms(userId: string, id: string, data: any): Promise<NoteAndTerms> {
   if (!isUUID(id) || !isUUID(userId)) {
    throw new Error('Invalid UUID format');
  }
  const existing = await prisma.noteAndTerms.findFirst({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error("Unauthorized");
  return prisma.noteAndTerms.update({ where: { id }, data });
}

export async function deleteNoteAndTerms(userId: string, id: string): Promise<NoteAndTerms> {
   if (!isUUID(id) || !isUUID(userId)) {
    throw new Error('Invalid UUID format');
  }
  const existing = await prisma.noteAndTerms.findFirst({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error("Unauthorized");
  return prisma.noteAndTerms.delete({ where: { id } });
}
