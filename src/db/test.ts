import linie from './linie.geojson?raw';
import wojewodztwa from './wojewodztwa.geojson?raw';
// Symulacja danych

const wojewodztwaGeoJSON = JSON.parse(wojewodztwa);


const linieGeoJSON = JSON.parse(linie);

// tylko dla testów wykresów
const chartGeoJSON = {
    type: 'FeatureCollection',
    crs: {
        type: 'name',
        // WAŻNE: W GeoJSON CRS musi być zdefiniowany jako nazwa, ale OpenLayers użyje Proj4js
        // do transformacji zdefiniowanej dla 'EPSG:4258'
        properties: {name: 'urn:ogc:def:crs:EPSG::4258'},
    },
    features: [
        {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [19.0, 52.0]}, // Przykładowe współrzędne w EPSG:4258 (Polska)
            properties: {dane1: 10, dane2: 5, dane3: 15},
        },
        {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [20.0, 52.5]},
            properties: {dane1: 20, dane2: 3, dane3: 8},
        },
        {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [21.0, 53.0]},
            properties: {dane1: 5, dane2: 12, dane3: 3},
        },
    ],
};

export {wojewodztwaGeoJSON, linieGeoJSON, chartGeoJSON};
