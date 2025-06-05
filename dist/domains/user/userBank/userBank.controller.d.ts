import { Request, Response } from "express";
export declare const createHandler: (req: Request, res: Response) => Promise<void>;
export declare const listHandler: (req: Request, res: Response) => Promise<void>;
export declare const detailHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateHandler: (req: Request, res: Response) => Promise<void>;
export declare const deleteHandler: (req: Request, res: Response) => Promise<void>;
