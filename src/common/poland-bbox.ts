import {transformExtent} from "ol/proj";

// Współrzędne BBox Polski (przybliżone dla celów maski i widoku)
// Polska ogólny zasięg w EPSG:4326 dla zablokowania widoku
export const POLAND_EXTENT_4326 = [14.0, 49.0, 24.5, 55.0];
export const POLAND_EXTENT_3857 = transformExtent(POLAND_EXTENT_4326, 'EPSG:4326', 'EPSG:3857');
