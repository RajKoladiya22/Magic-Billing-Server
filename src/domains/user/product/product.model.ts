// src/domains/product/product.model.ts
import { PrismaClient, Product as PrismaProduct } from "@prisma/client";

export const prisma = new PrismaClient();
export type Product = PrismaProduct;
