import linie from './linie.geojson?raw';
import wojewodztwa from './wojewodztwa.geojson?raw';
// Symulacja danych

const wojewodztwaGeoJSON =    JSON.parse(wojewodztwa)

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
                properties: {data1: 10, data2: 5, data3: 15},
            },
            {
                type: 'Feature',
                geometry: {type: 'Point', coordinates: [20.0, 52.5]},
                properties: {data1: 20, data2: 3, data3: 8},
            },
            {
                type: 'Feature',
                geometry: {type: 'Point', coordinates: [21.0, 53.0]},
                properties: {data1: 5, data2: 12, data3: 3},
            },
        ],
    };
const linieGeoJSON = JSON.parse(linie) || { /* ... Twoje dane z EPSG:2180 ... */
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::2180"}},
    "features": [
        // Przykładowa linia w centralnej Polsce w EPSG:2180
        {
            "type": "Feature",
            "properties": {"id": 1},
            "geometry": {"type": "LineString", "coordinates": [[380000, 410000], [385000, 415000]]}
        },
    ]
}


export {wojewodztwaGeoJSON, linieGeoJSON, chartGeoJSON};
