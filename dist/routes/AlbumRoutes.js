"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const control_1 = require("../Control/control");
const AlbumRoutes = express_1.default.Router();
AlbumRoutes.get('/:albumId', control_1.getAlbumsbyID);
AlbumRoutes.get('/:albumId/songs', control_1.getAlbumSongsbyID);
AlbumRoutes.get('/', control_1.getAlbumswithSongs);
exports.default = AlbumRoutes;
