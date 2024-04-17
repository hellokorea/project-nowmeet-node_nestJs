"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOptions = void 0;
const multer = require("multer");
const multerOptions = () => {
    return {
        storage: multer.memoryStorage(),
    };
};
exports.multerOptions = multerOptions;
//# sourceMappingURL=multer.options.js.map