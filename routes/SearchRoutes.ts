import express  from "express";
import { getSearchAlbumsParams, getSearchArtistsParams, getSearchParams, getSearchSongsParams } from '../Control/control';



const SearchRoute = express.Router();


SearchRoute.get('/albums',getSearchAlbumsParams);
SearchRoute.get('/artists',getSearchArtistsParams);
SearchRoute.get('/songs',getSearchSongsParams);
SearchRoute.get('/',getSearchParams)

export default SearchRoute;