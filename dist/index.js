"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const zipFold_1 = __importDefault(require("./routes/zipFold"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Register the ZIP route here
app.use(zipFold_1.default);
// Other routes, static files, etc.
app.listen(process.env.PORT, () => console.log(`Server running on port:${process.env.PORT}`));
