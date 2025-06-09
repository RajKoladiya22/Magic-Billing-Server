import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../config/database.config";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../../core/utils/httpResponse";
import { uploadToCloudinary, deleteFromCloudinary } from "./services/uploadToCloudinary.service";
import { validate as isUUID } from "uuid";
import { UploadApiResponse } from "cloudinary";
import { log } from "console";

const PAGE_SIZE = 10;

// export const listProducts = async (req: Request, res: Response) => {
//   const userId = req.user?.id;
//   if (!userId) {
//     sendErrorResponse(res, 401, "Unauthorized");
//     return;
//   }

//   const search = (req.query.search as string) || "";
//   const page = Math.max(1, parseInt((req.query.page as string) || "1"));

//   try {
//     const where: any = { userId };
//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: "insensitive" } },
//         { barcode: { contains: search, mode: "insensitive" } },
//       ];
//     }

//     const [total, products] = await Promise.all([
//       prisma.product.count({ where }),
//       prisma.product.findMany({
//         where,
//         skip: (page - 1) * PAGE_SIZE,
//         take: PAGE_SIZE,
//         orderBy: { createdAt: "desc" },
//       }),
//     ]);

//     sendSuccessResponse(res, 200, "Products fetched.", {
//       total,
//       page,
//       pageSize: PAGE_SIZE,
//       products,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       sendErrorResponse(res, 400, error.message);
//     } else {
//       sendErrorResponse(res, 500, "Failed to fatch product.");
//     }
//   }
// };

export const listProducts = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }

  // pagination
  const page = Math.max(1, parseInt((req.query.page as string) || "1"));
  const PAGE_SIZE = 10;

  // optional filters
  const search = (req.query.search as string) || "";
  const typeFilter = (req.query.type as string)?.toUpperCase();       // "PRODUCT" or "SERVICE"
  const isActiveQuery = req.query.isActive as string | undefined;

  // build the WHERE clause
  const where: any = { userId };

  where.isActive = true;

   if (typeof isActiveQuery !== "undefined") {
    if (isActiveQuery === "false") where.isActive = false;
    else if (isActiveQuery === "true") where.isActive = true;
    // if they pass something else, we ignore it and keep true
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }
  if (typeFilter === "PRODUCT" || typeFilter === "SERVICE") {
    where.type = typeFilter;
  }

  try {
    // count total matching
    const total = await prisma.product.count({ where });

    // fetch page, but order so that default=true come first
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [
        { default: "desc" },        // default=true first
        { createdAt: "desc" },      // then newest first
      ],
    });

    sendSuccessResponse(res, 200, "Products fetched.", {
      total,
      page,
      pageSize: PAGE_SIZE,
      products,
    });
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to list product.");
    }
  }
};

export const getProduct = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  if (!isUUID(id)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return;
  }

  try {
    const p = await prisma.product.findFirst({ where: { id, userId } });
    if (!p) {
      sendErrorResponse(res, 404, "Product not found.");
      return
    }
    sendSuccessResponse(res, 200, "Product fetched.", p);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to fetch product.");
    }
  }

};

export const createProduct = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }

  try {
    // 1. Extract body fields
    const {
      type,
      name,
      sellingPrice,
      purchasePrice,
      taxRate,
      hsnCode,
      sacCode,
      barcode,
      isActive = true,
      isTaxable = true,
      onlinestore = true,
      notForSale = false,
      default: isDefault = false,
      categoryId,
      unitId,
    } = req.body;

    // 2. Validate required fields
    if (!type || !name || !sellingPrice || !purchasePrice) {
      sendErrorResponse(res, 400, "Missing required fields.");
      return;
    }

    // 3. Handle image uploads
    const files = req.files as Express.Multer.File[] | undefined;
    const images: Array<{ id: string; url: string }> = [];

    if (files && files.length > 0) {
      for (const file of files) {
        // optional: validate extension here
        const result = await uploadToCloudinary(file.path);
        images.push({ id: result.public_id, url: result.secure_url });
      }
    }

    // 4. Build the create payload
    const payload = {
      type,
      name,
      sellingPrice: JSON.parse(sellingPrice),
      purchasePrice: JSON.parse(purchasePrice),
      taxRate: taxRate !== undefined ? parseFloat(taxRate) : null,
      hsnCode: hsnCode || null,
      sacCode: sacCode || null,
      barcode: barcode || null,
      isActive: Boolean(isActive),
      isTaxable: Boolean(isTaxable),
      onlinestore: Boolean(onlinestore),
      notForSale: Boolean(notForSale),
      default: Boolean(isDefault),
      categoryId: categoryId || null,
      unitId: unitId || null,
      userId,
      images,
    };

    // 5. Persist to DB
    const product = await prisma.product.create({ data: payload });

    // 6. Respond
    sendSuccessResponse(res, 201, "Product created successfully.", product);
  } catch (err: any) {
    console.error("Create product error:", err);
    if (err instanceof Error) {
      sendErrorResponse(res, 400, err.message);
    } else {
      sendErrorResponse(res, 500, "Failed to create product.");
    }
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: productId } = req.params;

  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return
  }
  if (!isUUID(productId)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return
  }

  try {
    // 1. Fetch the existing product
    const existing = await prisma.product.findFirst({
      where: { id: productId, userId }
    });
    if (!existing) {
      sendErrorResponse(res, 404, "Product not found.");
      return
    }

    // 2. Upload any new images and append to existing.images
    const files = req.files as Express.Multer.File[] | undefined;
    const newImages: Array<{ id: string; url: string }> = [];

    if (files && files.length) {
      for (const file of files) {
        const result: UploadApiResponse = await uploadToCloudinary(file.path);
        newImages.push({ id: result.public_id, url: result.secure_url });
      }
    }

    // 3. Build update payload
    //    - merge new images onto existing.images
    //    - spread all other fields from req.body
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...req.body,
        images: [
          ...(Array.isArray(existing.images) ? existing.images as any[] : []),
          ...newImages
        ]
      },
    });

    sendSuccessResponse(res, 200, "Product updated.", updated);
  } catch (err: any) {
    console.error("updateProduct error:", err);
    sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to update product.");
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: productId } = req.params;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return
  }
  if (!isUUID(productId)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return
  }

  try {
    // 1. Fetch images
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) {
      sendErrorResponse(res, 404, "Product not found.");
      return
    }

    // 2. Delete from Cloudinary
    const imgs = Array.isArray(product.images) ? product.images : [];
    for (const img of imgs) {
      await deleteFromCloudinary((img as any).id);
    }

    // 3. Delete DB record
    const deletedProduct = await prisma.product.delete({ where: { id: productId } });
    sendSuccessResponse(res, 200, "Product & its images deleted.", deletedProduct);
  } catch (err: any) {
    console.error("deleteProduct error:", err);
    sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete product.");
  }
};

export const bulkDeleteProducts = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { ids } = req.body as { ids: string[] };
  // console.log("\n\n\n bulkDeleteProducts called with ids:", ids);
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return
  }
  if (!Array.isArray(ids) || !ids.every(isUUID)) {
    sendErrorResponse(res, 400, "Invalid IDs array.");
    return
  }

  try {
    // 1. Fetch all products to delete
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, userId },
      select: { images: true },
    });

    // 2. Delete all their images from Cloudinary
    for (const prod of products) {
      const imgs = Array.isArray(prod.images) ? prod.images : [];
      for (const img of imgs) {
        await deleteFromCloudinary((img as any).id);
      }
    }

    // 3. Bulk delete records
    const del = await prisma.product.deleteMany({ where: { id: { in: ids }, userId } });
    sendSuccessResponse(res, 200, `Deleted ${del.count} products & their images.`);
  } catch (err: any) {
    console.error("bulkDeleteProducts error:", err);
    sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed bulk delete.");
  }
};

export const toggleDefault = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  if (!isUUID(id)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return;
  }

  try {
    const prod = await prisma.product.findFirst({ where: { id, userId } });
    if (!prod) {
      sendErrorResponse(res, 404, "Not found.");
      return
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { default: !prod.default },
    });
    sendSuccessResponse(res, 200, "Toggled default.", updated);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Opretion Failed on product.");
    }
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  if (!isUUID(id)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return;
  }

  try {
    const prod = await prisma.product.findFirst({ where: { id, userId } });
    if (!prod) {
      sendErrorResponse(res, 404, "Not found.");
      return

    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !prod.isActive },
    });
    sendSuccessResponse(res, 200, "Toggled active.", updated);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Opretion Failed on product.");
    }
  }
};

/**
 * POST /api/v1/products/:id/images
 * Upload one or more images to Cloudinary and append to product.images
 */
export const uploadImages = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: productId } = req.params;
  const files = req.files as Express.Multer.File[];
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  if (!isUUID(productId)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return;
  }
  if (!files || files.length === 0) {
    sendErrorResponse(res, 400, "No images provided.");
    return
  }

  try {
    // 1. Fetch the existing product
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });

    if (!product) {
      sendErrorResponse(res, 404, "Product not found.");
      return
    }

    // 2. Upload each file to Cloudinary
    const uploads: Array<{ id: string; url: string }> = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.path);
      uploads.push({ id: result.public_id, url: result.secure_url });
    }

    // 3. Append to existing images array (or start a new one)
    const currentImages = Array.isArray(product.images) ? product.images : [];
    const updatedImages = [...currentImages, ...uploads];

    // 4. Save back to the database
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    });

    sendSuccessResponse(res, 200, "Images uploaded successfully.", updated);
  } catch (err:any) {
    console.error("uploadProductImages error:", err);
    sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to upload images.");
  }
};

/**
 * DELETE /api/v1/products/:id/images
 * Body: { ids: string[] } — array of Cloudinary public_ids to delete
 */
export const deleteImages = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: productId } = req.params;
  const { ids } = req.body as { ids: string[] };

  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  if (!isUUID(productId)) {
    sendErrorResponse(res, 400, "Invalid product ID.");
    return;
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    sendErrorResponse(res, 400, "Must provide an array of image IDs to delete.");
    return
  }

  try {
    // 1. Fetch product
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });
    if (!product) {
      sendErrorResponse(res, 404, "Product not found.");
      return
    }

    // 2. Delete each from Cloudinary
    for (const publicId of ids) {
      await deleteFromCloudinary(publicId);
    }

    // 3. Filter out from DB array
    const currentImages = Array.isArray(product.images) ? product.images : [];
    const remaining = currentImages.filter(
      (img: any) => !ids.includes(img.id)
    );

    // 4. Save back to DB
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { images: remaining },
    });

    sendSuccessResponse(res, 200, "Images deleted successfully.", updated);
  } catch (err:any) {
    console.error("deleteProductImages error:", err);
    sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete product.");
  }
};
