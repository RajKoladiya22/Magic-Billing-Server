import { Request, Response, NextFunction } from "express";
export declare const checkStaticToken: (whitelist?: string[]) => (req: Request, res: Response, next: NextFunction) => void;
