"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const control_1 = require("../Control/control");
const ArtistRoute = express_1.default.Router();
ArtistRoute.get('/:artistId', control_1.getArtistsbyID);
ArtistRoute.get('/:artistId/songs', control_1.getArtistsSongsbyID);
exports.default = ArtistRoute;
