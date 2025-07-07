"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SongsRoutes = express_1.default.Router();
const control_1 = require("../Control/control");
SongsRoutes.get('/:id', control_1.getSongsbyID);
SongsRoutes.get('/', control_1.getSongs);
exports.default = SongsRoutes;
