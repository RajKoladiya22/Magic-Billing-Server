// src/controllers/units.controller.ts

import { Request, Response } from "express";
import { prisma } from "../../config/database.config";
import {
    sendErrorResponse,
    sendSuccessResponse,
} from "../../core/utils/httpResponse";
import { Prisma } from "@prisma/client";
import { validate as isUUID } from 'uuid';
import { log } from "console";

/**
 * Fetch all units (optionally filtered by "search" query param),
 * sorted alphabetically (name ASC).
 *
 * GET /api/v1/units?search=<optional substring>
 */
export const getAllUnits = async (req: Request, res: Response) => {
    try {
        const searchTerm = (req.query.search as string) || "";

        // Build a "where" clause only if a search term was provided
        const whereClause = searchTerm
            ? {
                name: {
                    contains: searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                },
            }
            : {};

        const units = await prisma.unit.findMany({
            where: whereClause,
            orderBy: { name: "asc" },
        });

        if (units.length === 0) {
            sendErrorResponse(res, 404, "No units found.");
            return
        }

        sendSuccessResponse(res, 200, "Units retrieved successfully.", units);
    } catch (error) {
        if (error instanceof Error) {
            sendErrorResponse(res, 404, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to fetch units.");
        }
    }
};

/**
 * Fetch a single unit by ID
 * GET /api/v1/units/:id
 */
export const getUnitById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isUUID(id)) {
        throw new Error('Invalid UUID format');
    }
    try {
        const unit = await prisma.unit.findUnique({
            where: { id },
        });

        if (!unit) {
            sendErrorResponse(res, 400, "Unit not found.");
            return;
        }
        sendSuccessResponse(res, 200, "Units retrieved successfully.", unit);
    } catch (error) {
        if (error instanceof Error) {
            sendErrorResponse(res, 404, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to fetch units.");
        }
    }
};

/**
 * Create a new unit
 * POST /api/v1/units
 * Body: { name: string; abbreviation?: string }
 */
export const createUnit = async (req: Request, res: Response) => {
    const { name, abbreviation } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        sendErrorResponse(res, 400, "Name is required and must be a non-empty string.");
        return;
    }

    try {
        const newUnit = await prisma.unit.create({
            data: {
                name: name.trim(),
                abbreviation: abbreviation?.trim() || null,
            },
        });
        if (!newUnit) {
            sendErrorResponse(res, 400, "Failed to create unit.");
            return;
        }
        sendSuccessResponse(res, 200, "Units retrieved successfully.", newUnit);
    } catch (error) {
        if (error instanceof Error) {
            sendErrorResponse(res, 404, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create units.");
        }
    }
};

/**
 * Update an existing unit
 * PUT /api/v1/units/:id
 * Body: { name?: string; abbreviation?: string }
 */
export const updateUnit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, abbreviation } = req.body;
    if (!isUUID(id)) {
        throw new Error('Invalid UUID format');
    }

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        sendErrorResponse(res, 400, "If provided, name must be a non-empty string.");
        return;
    }

    try {
        // Check existence first
        const existing = await prisma.unit.findUnique({ where: { id } });
        if (!existing) {
            sendErrorResponse(res, 404, "Unit not found.");
            return;
        }

        const updatedUnit = await prisma.unit.update({
            where: { id },
            data: {
                name: name !== undefined ? name.trim() : undefined,
                abbreviation: abbreviation !== undefined ? abbreviation.trim() : undefined,
            },
        });

        if (!updatedUnit) {
            sendErrorResponse(res, 400, "Failed to update unit.");
            return;
        }
        sendSuccessResponse(res, 200, "Units updated successfully.", updatedUnit);
    } catch (error) {
        if (error instanceof Error) {
            sendErrorResponse(res, 404, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to update units.");
        }
    }
};

/**
 * Delete a unit
 * DELETE /api/units/:id
 */
export const deleteUnit = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!isUUID(id)) {
        throw new Error('Invalid UUID format');
    }
    try {
        // Check existence first
        const existing = await prisma.unit.findUnique({ where: { id } });
        if (!existing) {
            sendErrorResponse(res, 404, "Unit not found.");
            return;
        }

        // If there are products or other dependencies tied to this unit,
        // you may need to handle cascade or disallow deletion. For now, we'll just delete.
        const deletedUnit = await prisma.unit.delete({ where: { id } });
        if (!deletedUnit) {
            sendErrorResponse(res, 400, "Failed to delete unit.");
            return;
        }
        sendSuccessResponse(res, 200, "Unit deleted successfully.", deletedUnit);

    } catch (error: any) {
        console.error(`Error deleting unit with id=${id}:`, error);

        // If foreign key constraint prevents deletion, Prisma throws an error with code "P2003"
        if (error.code === "P2003") {
            sendErrorResponse(res, 400, "Cannot delete unit because it is referenced by other records.");
        }
        if (error instanceof Error) {
            sendErrorResponse(res, 404, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to delete units.");
        }
    }
};


/**
 * Create multiple units in bulk
 * POST /api/v1/units/bulk
 * Body: [ { name: string; abbreviation?: string }, ... ]
 */
export const createUnitsBulk = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // 1. Must be a non-empty array
    if (!Array.isArray(payload) || payload.length === 0) {
      sendErrorResponse(res, 400, "Request body must be a non-empty array of units.");
      return;
    }

    // 2. Validate each entry: must have a non-empty string "name"
    const dataToInsert: { name: string; abbreviation?: string | null }[] = [];
    for (const item of payload) {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof item.name !== "string" ||
        item.name.trim().length === 0
      ) {
        sendErrorResponse(
          res,
          400,
          "Each array element must be an object with a non-empty string `name`."
        );
        return;
      }

      dataToInsert.push({
        name: item.name.trim(),
        abbreviation:
          typeof item.abbreviation === "string" && item.abbreviation.trim().length > 0
            ? item.abbreviation.trim()
            : null,
      });
    }

    // 3. Use Prisma's createMany to insert all at once
    //    You can add skipDuplicates: true if you want to ignore conflicts on unique fields.
    const result = await prisma.unit.createMany({
      data: dataToInsert,
      skipDuplicates: false, // or true if you want to ignore duplicate names/IDs
    });

    // result.count = number of rows inserted
    sendSuccessResponse(
      res,
      201,
      `Successfully inserted ${result.count} unit(s).`,
      result
    );
  } catch (error: any) {
    console.error("Error in createUnitsBulk:", error.message);

    // If Prisma throws a known error (e.g. unique constraint), return 400
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to create units in bulk.");
    }
  }
};

/**
 * Bulk‐delete multiple units
 * DELETE /api/v1/units/bulk
 * Body: { ids: string[] }
 */
export const deleteUnitsBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    console.log("\n\n\n Received IDs for bulk delete:", ids);
    // 1. Must be a non‐empty array of strings
    if (!Array.isArray(ids) || ids.length === 0) {
      sendErrorResponse(res, 400, "Request body must include a non-empty array of unit IDs.");
      return;
    }

    // 2. Validate each ID is a valid UUID
    for (const id of ids) {
      if (typeof id !== "string" || !isUUID(id)) {
        // console.log(`\n Invalid UUID format: ${id}`);
        sendErrorResponse(res, 400, `Invalid UUID format: ${id}`);
        return;
      }
    }

    // 3. Perform deleteMany: this will delete all units whose id is in the array
    const deleteResult = await prisma.unit.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // deleteResult.count = number of rows actually deleted
    if (deleteResult.count === 0) {
      // None of the provided IDs matched an existing unit
      sendErrorResponse(res, 404, "No units were deleted. Check that the IDs exist.");
      return;
    }

    // 4. Return success with how many were deleted
    sendSuccessResponse(
      res,
      200,
      `Successfully deleted ${deleteResult.count} unit(s).`,
      deleteResult
    );
  } catch (error: any) {
    console.error("Error in deleteUnitsBulk:", error);

    // If Prisma throws a known foreign-key constraint (P2003) or other error, bubble out the message
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to delete units in bulk.");
    }
  }
};
