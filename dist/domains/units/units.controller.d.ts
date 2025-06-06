import { Request, Response } from "express";
export declare const getAllUnits: (req: Request, res: Response) => Promise<void>;
export declare const getUnitById: (req: Request, res: Response) => Promise<void>;
export declare const createUnit: (req: Request, res: Response) => Promise<void>;
export declare const updateUnit: (req: Request, res: Response) => Promise<void>;
export declare const deleteUnit: (req: Request, res: Response) => Promise<void>;
export declare const createUnitsBulk: (req: Request, res: Response) => Promise<void>;
export declare const deleteUnitsBulk: (req: Request, res: Response) => Promise<void>;
