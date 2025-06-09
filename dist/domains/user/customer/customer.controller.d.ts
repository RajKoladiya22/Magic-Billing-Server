import { Request, Response } from "express";
export declare const listCustomers: (req: Request, res: Response) => Promise<void>;
export declare const getCustomer: (req: Request, res: Response) => Promise<void>;
export declare const createCustomer: (req: Request, res: Response) => Promise<void>;
export declare const updateCustomer: (req: Request, res: Response) => Promise<void>;
export declare const deleteCustomer: (req: Request, res: Response) => Promise<void>;
export declare const bulkDeleteCustomers: (req: Request, res: Response) => Promise<void>;
