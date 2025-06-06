import { Request, Response } from "express";
import { prisma } from "../../../config/database.config";
import {
    sendErrorResponse,
    sendSuccessResponse,
} from "../../../core/utils/httpResponse";
import { Prisma } from "@prisma/client";
import { validate as isUUID } from "uuid";

/**
 * GET /api/v1/categories?search=<optional substring>
 * Fetch all categories, optionally filtered by name (case‐insensitive),
 * sorted alphabetically (name ASC).
 */
export const getAllCategories = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    try {
        const searchTerm = (req.query.search as string) || "";

        // Build a Prisma.WhereInput if searchTerm is provided
        const whereClause: Prisma.CategoryWhereInput = {
            userId, // filter by current user
            ...(searchTerm
                ? {
                    name: {
                        contains: searchTerm,
                        mode: Prisma.QueryMode.insensitive,
                    },
                }
                : {}),
        };

        const categories = await prisma.category.findMany({
            where: whereClause,
            orderBy: { name: "asc" },
        });

        if (categories.length === 0) {
            sendErrorResponse(res, 404, "No categories found.");
            return;
        }

        sendSuccessResponse(res, 200, "Categories retrieved successfully.", categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        sendErrorResponse(res, 500, "Failed to fetch categories.");
    }
};

/**
 * GET /api/v1/categories/:id
 * Fetch a single category by its UUID
 */
export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Validate UUID format
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid UUID format for category ID.");
        return;
    }

    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    try {
        const category = await prisma.category.findUnique({
            where: { id, userId },
        });

        if (!category) {
            sendErrorResponse(res, 404, "Category not found.");
            return;
        }

        sendSuccessResponse(res, 200, "Category retrieved successfully.", category);
    } catch (error) {
        console.error(`Error fetching category with id=${id}:`, error);
        sendErrorResponse(res, 500, "Failed to fetch category.");
    }
};

/**
 * POST /api/v1/categories
 * Create a new category.
 * Body: { name: string; userId: string; hsnCode?: string; description?: string }
 */
export const createCategory = async (req: Request, res: Response) => {
    const { name, hsnCode, description } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    // Basic validations
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        sendErrorResponse(res, 400, "Name is required and must be a non-empty string.");
        return;
    }
    if (!userId || typeof userId !== "string" || !isUUID(userId)) {
        sendErrorResponse(res, 400, "userId is required and must be a valid UUID.");
        return;
    }

    try {
        const newCategory = await prisma.category.create({
            data: {
                name: name.trim(),
                userId,
                hsnCode: typeof hsnCode === "string" && hsnCode.trim().length > 0 ? hsnCode.trim() : null,
                description:
                    typeof description === "string" && description.trim().length > 0
                        ? description.trim()
                        : null,
            },
        });

        sendSuccessResponse(res, 201, "Category created successfully.", newCategory);
    } catch (error: any) {
        console.error("Error creating category:", error);
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create category.");
        }
    }
};

/**
 * POST /api/v1/categories/bulk
 * Create multiple categories in one request.
 * Body: [ { name: string; userId: string; hsnCode?: string; description?: string }, … ]
 */
export const createCategoriesBulk = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    try {
        const payload = req.body;

        // Must be a non-empty array
        if (!Array.isArray(payload) || payload.length === 0) {
            sendErrorResponse(res, 400, "Request body must be a non-empty array of categories.");
            return;
        }

        const dataToInsert: {
            name: string;
            userId: string;
            hsnCode?: string | null;
            description?: string | null;
        }[] = [];

        for (const item of payload) {
            // Ensure item is an object and has a valid name + userId
            if (
                typeof item !== "object" ||
                item === null ||
                typeof item.name !== "string" ||
                item.name.trim().length === 0
            ) {
                sendErrorResponse(
                    res,
                    400,
                    "Each element must be an object with non-empty string `name`."
                );
                return;
            }

            dataToInsert.push({
                name: item.name.trim(),
                userId,
                hsnCode:
                    typeof item.hsnCode === "string" && item.hsnCode.trim().length > 0
                        ? item.hsnCode.trim()
                        : null,
                description:
                    typeof item.description === "string" && item.description.trim().length > 0
                        ? item.description.trim()
                        : null,
            });
        }

        const result = await prisma.category.createMany({
            data: dataToInsert,
            skipDuplicates: false, // set to true if you want to ignore conflicts
        });

        sendSuccessResponse(
            res,
            201,
            `Successfully inserted ${result.count} category(ies).`,
            { insertedCount: result.count }
        );
    } catch (error: any) {
        console.error("Error in createCategoriesBulk:", error);
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create categories in bulk.");
        }
    }
};

/**
 * PUT /api/v1/categories/:id
 * Update an existing category by ID.
 * Body: { name?: string; userId?: string; hsnCode?: string; description?: string }
 */
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    const { name, hsnCode, description } = req.body;

    // Validate ID
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid UUID format for category ID.");
        return;
    }

    // If provided, name must be non-empty string
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        sendErrorResponse(res, 400, "If provided, `name` must be a non-empty string.");
        return;
    }

    // If provided, userId must be a valid UUID
    if (userId !== undefined && (typeof userId !== "string" || !isUUID(userId))) {
        sendErrorResponse(res, 400, "If provided, `userId` must be a valid UUID.");
        return;
    }

    try {
        // Check existence
        const existing = await prisma.category.findUnique({ where: { id, userId } });
        if (!existing) {
            sendErrorResponse(res, 404, "Category not found.");
            return;
        }

        const updated = await prisma.category.update({
            where: { id, userId },
            data: {
                name: name !== undefined ? name.trim() : undefined,
                hsnCode: hsnCode !== undefined ? (hsnCode.trim() || null) : undefined,
                description: description !== undefined ? (description.trim() || null) : undefined,
            },
        });

        sendSuccessResponse(res, 200, "Category updated successfully.", updated);
    } catch (error: any) {
        console.error(`Error updating category with id=${id}:`, error);
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to update category.");
        }
    }
};

/**
 * DELETE /api/v1/categories/:id
 * Delete one category by ID.
 */
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid UUID format for category ID.");
        return;
    }

    try {
        const existing = await prisma.category.findUnique({ where: { id, userId } });
        if (!existing) {
            sendErrorResponse(res, 404, "Category not found.");
            return;
        }

        const deleted = await prisma.category.delete({ where: { id, userId } });
        sendSuccessResponse(res, 200, "Category deleted successfully.", deleted);
    } catch (error: any) {
        console.error(`Error deleting category with id=${id}:`, error);

        // If there’s a foreign-key constraint (e.g. products referencing), Prisma returns code P2003
        if (error.code === "P2003") {
            sendErrorResponse(
                res,
                400,
                "Cannot delete category because it is referenced by other records."
            );
        } else if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to delete category.");
        }
    }
};

/**
 * DELETE /api/v1/categories/bulk
 * Bulk‐delete multiple categories by ID.
 * Body: { ids: string[] }
 */
export const deleteCategoriesBulk = async (req: Request, res: Response) => {
     const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            sendErrorResponse(res, 400, "Request body must include a non-empty array of category IDs.");
            return;
        }

        // Validate each ID
        for (const id of ids) {
            if (typeof id !== "string" || !isUUID(id)) {
                sendErrorResponse(res, 400, `Invalid UUID format: ${id}`);
                return;
            }
        }

        const deleteResult = await prisma.category.deleteMany({
            where: {
                id: { in: ids },
                userId
            },
        });

        if (deleteResult.count === 0) {
            sendErrorResponse(res, 404, "No categories were deleted. Check that the IDs exist.");
            return;
        }

        sendSuccessResponse(
            res,
            200,
            `Successfully deleted ${deleteResult.count} category(ies).`,
            { deletedCount: deleteResult.count }
        );
    } catch (error: any) {
        console.error("Error in deleteCategoriesBulk:", error);
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to delete categories in bulk.");
        }
    }
};
