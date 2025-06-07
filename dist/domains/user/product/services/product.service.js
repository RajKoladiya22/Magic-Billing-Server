"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductImage = exports.updateProductImage = exports.findProductImage = exports.findProductData = exports.createProduct = void 0;
const product_model_1 = require("../product.model");
const createProduct = async (input) => {
    var _a, _b, _c, _d, _e, _f;
    return await product_model_1.prisma.product.create({
        data: {
            type: input.type,
            name: input.name,
            sellingPrice: input.sellingPrice,
            purchasePrice: input.purchasePrice,
            taxRate: input.taxRate,
            hsnCode: input.hsnCode,
            sacCode: input.sacCode,
            barcode: input.barcode,
            isActive: (_a = input.isActive) !== null && _a !== void 0 ? _a : true,
            isTaxable: (_b = input.isTaxable) !== null && _b !== void 0 ? _b : true,
            onlinestore: (_c = input.onlinestore) !== null && _c !== void 0 ? _c : true,
            notForSale: (_d = input.notForSale) !== null && _d !== void 0 ? _d : false,
            default: (_e = input.default) !== null && _e !== void 0 ? _e : false,
            images: (_f = input.images) !== null && _f !== void 0 ? _f : [],
            userId: input.userId,
            categoryId: input.categoryId,
            unitId: input.unitId,
        },
    });
};
exports.createProduct = createProduct;
const findProductData = async (input) => {
    return await product_model_1.prisma.product.findMany({
        where: {
            userId: input.id,
        }
    });
};
exports.findProductData = findProductData;
const findProductImage = async (input) => {
    return await product_model_1.prisma.product.findFirst({
        where: {
            userId: input.userId,
            id: input.productId
        }
    });
};
exports.findProductImage = findProductImage;
const updateProductImage = async (input) => {
    const { userId, productId, imageUrls } = input;
    const product = await product_model_1.prisma.product.findFirst({
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
    if (imageUrls && imageUrls.length > 0) {
        product.images.push(...imageUrls);
    }
    else {
        console.error("No images provided to add.");
        throw new Error("No images provided.");
    }
    return await product_model_1.prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            images: product.images,
        },
    });
};
exports.updateProductImage = updateProductImage;
const deleteProductImage = async (input) => {
    const product = await product_model_1.prisma.product.findFirst({
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
    return await product_model_1.prisma.product.update({
        where: {
            id: input.productId,
        },
        data: {
            images: updatedImages,
        },
    });
};
exports.deleteProductImage = deleteProductImage;
//# sourceMappingURL=product.service.js.map