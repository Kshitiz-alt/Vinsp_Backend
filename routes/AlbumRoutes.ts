import express  from "express";

import { getAlbumsbyID, getAlbumSongsbyID, getAlbumswithSongs } from '../Control/control'

const AlbumRoutes = express.Router()

AlbumRoutes.get('/:albumId',getAlbumsbyID);
AlbumRoutes.get('/:albumId/songs',getAlbumSongsbyID)
AlbumRoutes.get('/',getAlbumswithSongs);

export default AlbumRoutes;