"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHandler = exports.updateHandler = exports.detailHandler = exports.listHandler = exports.createHandler = void 0;
const userBank_service_1 = require("./userBank.service");
const userBank_schema_1 = require("./userBank.schema");
const createHandler = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const parsed = userBank_schema_1.createUserBankSchema.safeParse(req.body);
        const bank = await (0, userBank_service_1.createUserBank)(userId, parsed);
        res.status(201).json({ success: true, bank });
    }
    catch (error) { }
};
exports.createHandler = createHandler;
const listHandler = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const banks = await (0, userBank_service_1.getUserBanks)(userId);
    res.json({ success: true, banks });
};
exports.listHandler = listHandler;
const detailHandler = async (req, res) => {
    var _a;
    const bank = await getUserBankById(req.params.id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!bank)
        return res.status(404).json({ error: "Not found" });
    res.json({ success: true, bank });
};
exports.detailHandler = detailHandler;
const updateHandler = async (req, res) => {
    var _a;
    const updated = await (0, userBank_service_1.updateUserBank)(req.params.id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, req.body);
    res.json({ success: true, bank: updated });
};
exports.updateHandler = updateHandler;
const deleteHandler = async (req, res) => {
    var _a;
    await (0, userBank_service_1.deleteUserBank)(req.params.id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    res.status(204).send();
};
exports.deleteHandler = deleteHandler;
//# sourceMappingURL=userBank.controller.js.map