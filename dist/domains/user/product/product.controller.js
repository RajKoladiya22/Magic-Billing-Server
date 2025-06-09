"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImages = exports.uploadImages = exports.toggleActive = exports.toggleDefault = exports.bulkDeleteProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const database_config_1 = require("../../../config/database.config");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const uploadToCloudinary_service_1 = require("./services/uploadToCloudinary.service");
const uuid_1 = require("uuid");
const PAGE_SIZE = 10;
const listProducts = async (req, res) => {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const PAGE_SIZE = 10;
    const search = req.query.search || "";
    const typeFilter = (_b = req.query.type) === null || _b === void 0 ? void 0 : _b.toUpperCase();
    const isActiveQuery = req.query.isActive;
    const where = { userId };
    where.isActive = true;
    if (typeof isActiveQuery !== "undefined") {
        if (isActiveQuery === "false")
            where.isActive = false;
        else if (isActiveQuery === "true")
            where.isActive = true;
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
        const total = await database_config_1.prisma.product.count({ where });
        const products = await database_config_1.prisma.product.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: [
                { default: "desc" },
                { createdAt: "desc" },
            ],
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Products fetched.", {
            total,
            page,
            pageSize: PAGE_SIZE,
            products,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to list product.");
        }
    }
};
exports.listProducts = listProducts;
const getProduct = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    try {
        const p = await database_config_1.prisma.product.findFirst({ where: { id, userId } });
        if (!p) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Product not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Product fetched.", p);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch product.");
        }
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const { type, name, sellingPrice, purchasePrice, taxRate, hsnCode, sacCode, barcode, isActive = true, isTaxable = true, onlinestore = true, notForSale = false, default: isDefault = false, categoryId, unitId, } = req.body;
        if (!type || !name || !sellingPrice || !purchasePrice) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Missing required fields.");
            return;
        }
        const files = req.files;
        const images = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const result = await (0, uploadToCloudinary_service_1.uploadToCloudinary)(file.path);
                images.push({ id: result.public_id, url: result.secure_url });
            }
        }
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
        const product = await database_config_1.prisma.product.create({ data: payload });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "Product created successfully.", product);
    }
    catch (err) {
        console.error("Create product error:", err);
        if (err instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, err.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create product.");
        }
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id: productId } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(productId)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    try {
        const existing = await database_config_1.prisma.product.findFirst({
            where: { id: productId, userId }
        });
        if (!existing) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Product not found.");
            return;
        }
        const files = req.files;
        const newImages = [];
        if (files && files.length) {
            for (const file of files) {
                const result = await (0, uploadToCloudinary_service_1.uploadToCloudinary)(file.path);
                newImages.push({ id: result.public_id, url: result.secure_url });
            }
        }
        const updated = await database_config_1.prisma.product.update({
            where: { id: productId },
            data: {
                ...req.body,
                images: [
                    ...(Array.isArray(existing.images) ? existing.images : []),
                    ...newImages
                ]
            },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Product updated.", updated);
    }
    catch (err) {
        console.error("updateProduct error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to update product.");
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id: productId } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(productId)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    try {
        const product = await database_config_1.prisma.product.findFirst({ where: { id: productId, userId } });
        if (!product) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Product not found.");
            return;
        }
        const imgs = Array.isArray(product.images) ? product.images : [];
        for (const img of imgs) {
            await (0, uploadToCloudinary_service_1.deleteFromCloudinary)(img.id);
        }
        const deletedProduct = await database_config_1.prisma.product.delete({ where: { id: productId } });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Product & its images deleted.", deletedProduct);
    }
    catch (err) {
        console.error("deleteProduct error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete product.");
    }
};
exports.deleteProduct = deleteProduct;
const bulkDeleteProducts = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { ids } = req.body;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!Array.isArray(ids) || !ids.every(uuid_1.validate)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid IDs array.");
        return;
    }
    try {
        const products = await database_config_1.prisma.product.findMany({
            where: { id: { in: ids }, userId },
            select: { images: true },
        });
        for (const prod of products) {
            const imgs = Array.isArray(prod.images) ? prod.images : [];
            for (const img of imgs) {
                await (0, uploadToCloudinary_service_1.deleteFromCloudinary)(img.id);
            }
        }
        const del = await database_config_1.prisma.product.deleteMany({ where: { id: { in: ids }, userId } });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, `Deleted ${del.count} products & their images.`);
    }
    catch (err) {
        console.error("bulkDeleteProducts error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed bulk delete.");
    }
};
exports.bulkDeleteProducts = bulkDeleteProducts;
const toggleDefault = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    try {
        const prod = await database_config_1.prisma.product.findFirst({ where: { id, userId } });
        if (!prod) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Not found.");
            return;
        }
        const updated = await database_config_1.prisma.product.update({
            where: { id },
            data: { default: !prod.default },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Toggled default.", updated);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Opretion Failed on product.");
        }
    }
};
exports.toggleDefault = toggleDefault;
const toggleActive = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    try {
        const prod = await database_config_1.prisma.product.findFirst({ where: { id, userId } });
        if (!prod) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Not found.");
            return;
        }
        const updated = await database_config_1.prisma.product.update({
            where: { id },
            data: { isActive: !prod.isActive },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Toggled active.", updated);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Opretion Failed on product.");
        }
    }
};
exports.toggleActive = toggleActive;
const uploadImages = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id: productId } = req.params;
    const files = req.files;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(productId)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    if (!files || files.length === 0) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "No images provided.");
        return;
    }
    try {
        const product = await database_config_1.prisma.product.findFirst({ where: { id: productId, userId } });
        if (!product) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Product not found.");
            return;
        }
        const uploads = [];
        for (const file of files) {
            const result = await (0, uploadToCloudinary_service_1.uploadToCloudinary)(file.path);
            uploads.push({ id: result.public_id, url: result.secure_url });
        }
        const currentImages = Array.isArray(product.images) ? product.images : [];
        const updatedImages = [...currentImages, ...uploads];
        const updated = await database_config_1.prisma.product.update({
            where: { id: productId },
            data: { images: updatedImages },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Images uploaded successfully.", updated);
    }
    catch (err) {
        console.error("uploadProductImages error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to upload images.");
    }
};
exports.uploadImages = uploadImages;
const deleteImages = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id: productId } = req.params;
    const { ids } = req.body;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(productId)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid product ID.");
        return;
    }
    if (!Array.isArray(ids) || ids.length === 0) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Must provide an array of image IDs to delete.");
        return;
    }
    try {
        const product = await database_config_1.prisma.product.findFirst({ where: { id: productId, userId } });
        if (!product) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Product not found.");
            return;
        }
        for (const publicId of ids) {
            await (0, uploadToCloudinary_service_1.deleteFromCloudinary)(publicId);
        }
        const currentImages = Array.isArray(product.images) ? product.images : [];
        const remaining = currentImages.filter((img) => !ids.includes(img.id));
        const updated = await database_config_1.prisma.product.update({
            where: { id: productId },
            data: { images: remaining },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Images deleted successfully.", updated);
    }
    catch (err) {
        console.error("deleteProductImages error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete product.");
    }
};
exports.deleteImages = deleteImages;
//# sourceMappingURL=product.controller.js.map