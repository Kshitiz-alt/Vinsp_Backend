import express  from "express";

const SongsRoutes = express.Router()

import { getSongs , getSongsbyID } from '../Control/control'


SongsRoutes.get('/:id',getSongsbyID);
SongsRoutes.get('/',getSongs);


export default SongsRoutes;