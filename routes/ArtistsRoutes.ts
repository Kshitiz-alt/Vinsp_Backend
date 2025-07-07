import express  from "express";


import { getArtistsbyID, getArtistsSongsbyID } from '../Control/control'

const ArtistRoute = express.Router()

ArtistRoute.get('/:artistId',getArtistsbyID);
ArtistRoute.get('/:artistId/songs',getArtistsSongsbyID)



export default ArtistRoute;