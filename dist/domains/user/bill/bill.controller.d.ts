import { Request, Response } from "express";
export declare const listBills: (req: Request, res: Response) => Promise<void>;
export declare const getBill: (req: Request, res: Response) => Promise<void>;
export declare const createBill: (req: Request, res: Response) => Promise<void>;
export declare const updateBill: (req: Request, res: Response) => Promise<void>;
export declare const deleteBill: (req: Request, res: Response) => Promise<void>;
export declare const bulkDeleteBills: (req: Request, res: Response) => Promise<void>;
