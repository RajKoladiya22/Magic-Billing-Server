import { NoteAndTerms } from "@prisma/client";
export declare function createNoteAndTerms(userId: string, data: any): Promise<NoteAndTerms>;
export declare function getNoteAndTerms(userId: string): Promise<NoteAndTerms[]>;
export declare function getNoteAndTermsById(id: string, userId: string): Promise<NoteAndTerms | null>;
export declare function updateNoteAndTerms(userId: string, id: string, data: any): Promise<NoteAndTerms>;
export declare function deleteNoteAndTerms(userId: string, id: string): Promise<NoteAndTerms>;
