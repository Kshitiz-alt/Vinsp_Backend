"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginated = getPaginated;
function getPaginated(data, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return data.slice(startIndex, endIndex);
}
;
