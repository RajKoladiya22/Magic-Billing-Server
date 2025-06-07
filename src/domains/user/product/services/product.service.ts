// src/domains/product/services/product.service.ts
import { prisma } from "../product.model";


export const createProduct = async (input: any) => {
  return await prisma.product.create({
    data: {
      type: input.type,
      name: input.name,
      sellingPrice: input.sellingPrice,
      purchasePrice: input.purchasePrice,
      taxRate: input.taxRate,
      hsnCode: input.hsnCode,
      sacCode: input.sacCode,
      barcode: input.barcode,
      isActive: input.isActive ?? true,
      isTaxable: input.isTaxable ?? true,
      onlinestore: input.onlinestore ?? true,
      notForSale: input.notForSale ?? false,
      default: input.default ?? false,
      images: input.images ?? [],
      userId: input.userId,
      categoryId: input.categoryId,
      unitId: input.unitId,
    },
  });
};

export const findProductData = async (input: any) => {

  return await prisma.product.findMany({
    where: {
      userId: input.id,

    }
  })

}
export const findProductImage = async (input: any) => {
  return await prisma.product.findFirst({
    where: {
      userId: input.userId,
      id: input.productId
    }
  })
}
export const updateProductImage = async (input: any) => {
  const { userId, productId, imageUrls } = input; 
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      userId: userId,
    },
    select: {
      images: true,
    },
  });

  if (!product || !Array.isArray(product.images)) {
    console.error("Product not found or images are not an array");
    return null;
  }

  // console.log("product images count:", product.images.length);

  if (imageUrls && imageUrls.length > 0) {
    product.images.push(...imageUrls);
  } else {
    console.error("No images provided to add.");
    throw new Error("No images provided.");
  }
  return await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      images: product.images,
    },
  });
};

export const deleteProductImage = async (input:any) => {
  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      userId: input.userId,
    },
    select: {
      images: true,
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const updatedImages = [...images];
  updatedImages.splice(input.imageIndex, 1);

  return await prisma.product.update({
    where: {
      id: input.productId,
    },
    data: {
      images: updatedImages,
    },
  });
};



