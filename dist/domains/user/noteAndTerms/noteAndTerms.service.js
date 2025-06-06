"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteAndTerms = createNoteAndTerms;
exports.getNoteAndTerms = getNoteAndTerms;
exports.getNoteAndTermsById = getNoteAndTermsById;
exports.updateNoteAndTerms = updateNoteAndTerms;
exports.deleteNoteAndTerms = deleteNoteAndTerms;
const database_config_1 = require("../../../config/database.config");
const uuid_1 = require("uuid");
async function createNoteAndTerms(userId, data) {
    if (!(0, uuid_1.validate)(userId)) {
        throw new Error('Invalid UUID format');
    }
    return database_config_1.prisma.noteAndTerms.create({
        data: { ...data, userId }
    });
}
async function getNoteAndTerms(userId) {
    if (!(0, uuid_1.validate)(userId)) {
        throw new Error('Invalid UUID format');
    }
    return database_config_1.prisma.noteAndTerms.findMany({ where: { userId } });
}
async function getNoteAndTermsById(id, userId) {
    if (!(0, uuid_1.validate)(id) || !(0, uuid_1.validate)(userId)) {
        throw new Error('Invalid UUID format');
    }
    const record = await database_config_1.prisma.noteAndTerms.findFirst({ where: { id, userId } });
    console.log(`Fetching NoteAndTerms by ID: ${id} for User ID: ${record}`);
    if (!record)
        throw new Error("Record not found");
    return record;
}
async function updateNoteAndTerms(userId, id, data) {
    if (!(0, uuid_1.validate)(id) || !(0, uuid_1.validate)(userId)) {
        throw new Error('Invalid UUID format');
    }
    const existing = await database_config_1.prisma.noteAndTerms.findFirst({ where: { id } });
    if (!existing || existing.userId !== userId)
        throw new Error("Unauthorized");
    return database_config_1.prisma.noteAndTerms.update({ where: { id }, data });
}
async function deleteNoteAndTerms(userId, id) {
    if (!(0, uuid_1.validate)(id) || !(0, uuid_1.validate)(userId)) {
        throw new Error('Invalid UUID format');
    }
    const existing = await database_config_1.prisma.noteAndTerms.findFirst({ where: { id } });
    if (!existing || existing.userId !== userId)
        throw new Error("Unauthorized");
    return database_config_1.prisma.noteAndTerms.delete({ where: { id } });
}
//# sourceMappingURL=noteAndTerms.service.js.map