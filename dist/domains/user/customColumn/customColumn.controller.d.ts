import { Request, Response } from "express";
export declare const listCustomColumns: (req: Request, res: Response) => Promise<void>;
export declare const getCustomColumn: (req: Request, res: Response) => Promise<void>;
export declare const createCustomColumn: (req: Request, res: Response) => Promise<void>;
export declare const updateCustomColumn: (req: Request, res: Response) => Promise<void>;
export declare const deleteCustomColumn: (req: Request, res: Response) => Promise<void>;
export declare const bulkDeleteCustomColumns: (req: Request, res: Response) => Promise<void>;
