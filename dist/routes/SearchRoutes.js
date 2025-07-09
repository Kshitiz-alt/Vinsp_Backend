"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const control_1 = require("../Control/control");
const SearchRoute = express_1.default.Router();
SearchRoute.get('/albums', control_1.getSearchAlbumsParams);
SearchRoute.get('/artists', control_1.getSearchArtistsParams);
SearchRoute.get('/songs', control_1.getSearchSongsParams);
SearchRoute.get('/', control_1.getSearchParams);
exports.default = SearchRoute;
