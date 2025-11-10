import CenterMap from '@mui/icons-material/CenterFocusStrong';
import {
    Box,
    Checkbox,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Tooltip,
    Typography
} from "@mui/material";

// @ts-ignore
import PathAnimation from 'ol-ext/featureAnimation/Path';

// @ts-ignore - Wymaga zewnętrznych definicji typów
import ChartStyle from 'ol-ext/style/Chart';
import {Attribution, defaults as defaultControls, ScaleLine, Zoom} from 'ol/control';
import {getCenter} from "ol/extent";
import type {FeatureLike} from "ol/Feature";
// import {getCenter} from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import Point from "ol/geom/Point";
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import * as proj from 'ol/proj';
import {register} from 'ol/proj/proj4';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import View from 'ol/View';
import proj4 from 'proj4';
import {type FC, useCallback, useEffect, useRef, useState} from 'react';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import {fitMapToJurisditionLayerExtent} from "../common/center-map.ts";
import {POLAND_EXTENT_3857} from "../common/poland-bbox.ts";
import {linieGeoJSON, wojewodztwaGeoJSON,} from "../db/test.ts";
import {
    BoxStyles,
    ControlCenterMap,
    ControlsAttribution,
    ControlsZoom,
    defaultStyle,
    lineStyle,
    MapStyles
} from "./styles/map-osm-poland.styles.tsx";
import {CHART_TYPES, type ChartType} from "./types/map-osm-poland.types.ts";

// Definicja CRS
// To jest kluczowy krok!
// EPSG:4258 (dla punktów/wykresów)
proj4.defs(
    'EPSG:4258',
    '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs +type=crs'
);

// EPSG:2180 (dla linii)
proj4.defs(
    'EPSG:2180',
    '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs +type=crs'
);
register(proj4);


const simplifyGeometries = (features: any[]) => {
    return features.map(feature => {
        const geometry = feature.getGeometry();
        if (geometry && geometry.simplify) {
            // Uproszczenie geometrii o 30% - eliminuje zbędne punkty
            geometry.simplify(50000); // Wartość w metrach (projekcja 3857)
        }
        return feature;
    });
};


export const MapOsmPolandData: FC = () => {

    const mapRef = useRef<HTMLDivElement>(null);

    const [map, setMap] = useState<Map | null>(null);
    const [layersVisible, setLayersVisible] = useState({
        wojewodztwa: true,
        linie: true,
        wykresy: true
    });
    const [chartType, setChartType] = useState<ChartType>('donut');

    const [id] = useState(Math.random().toString(36).substring(7));
    const mapId = `map-${id}`;
    const controlsZoomId = `map-box-controls-zoom-${id}`;
    const controlsAttributionId = `map-box-controls-attribution-${id}`;

    const handleCenterMap = () => {
        if (map) fitMapToJurisditionLayerExtent(map);
    };

    // Używamy useCallback, aby stworzyć warstwy tylko raz
    const createLayers = useCallback(() => {

        // --- WARSTWA 1: Warstwa Linii (EPSG:2180) - Wydajność poprzez uproszczony styl ---
        const lineFeatures = new GeoJSON().readFeatures(linieGeoJSON, {
            dataProjection: 'EPSG:2180',
            featureProjection: 'EPSG:3857',
        });

        simplifyGeometries(lineFeatures)
        const lineSource = new VectorSource({
            features: lineFeatures,
            // Limituj liczbę features renderowanych jednocześnie
            useSpatialIndex: true,
        });


        // --- WARSTWA 2: Warstwa Województw (Wykresy ChartStyle, EPSG:4258) ---
        const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(wojewodztwaGeoJSON, {
                // Dane GeoJSON mają układ współrzędnych EPSG:4258 (geograficzny/WGS84)
                dataProjection: 'EPSG:4258',
                // Docelowy układ współrzędnych mapy (domyślnie OpenLayers)
                featureProjection: 'EPSG:3857',
            }),
            useSpatialIndex: true,
        });

        const lineLayer = new VectorLayer({
            source: lineSource,
            visible: layersVisible.linie,
            properties: {name: 'linie'}, // Nazwa do zarządzania
            style: lineStyle,
            zIndex: 3,
            renderBuffer: 100,
            updateWhileAnimating: false,
            updateWhileInteracting: false, // Wylączenke aktualizację podczas interakcji
        });


        // 2. Definicja warstwy wektorowej województw
        const voivodeshipVectorLayer = new VectorLayer({
            source: vectorSource,
            style: defaultStyle,
            visible: layersVisible.wojewodztwa,
            properties: {name: 'wojewodztwa'}, // Nazwa do zarządzania
            zIndex: 2,
            renderBuffer: 100,
            updateWhileAnimating: false,
            updateWhileInteracting: false,
        });

        const chartFeatures = new GeoJSON().readFeatures(wojewodztwaGeoJSON, {
            dataProjection: 'EPSG:4258',
            featureProjection: 'EPSG:3857',
        }).map(feature => {
            // Zamień MultiPolygon na Point w centroidzie
            const geometry = feature.getGeometry();
            if (geometry && geometry.getType() === 'MultiPolygon') {
                const extent = geometry.getExtent();
                const centerCoord = getCenter(extent);
                feature.setGeometry(new Point(centerCoord));
            }
            return feature;
        });

        const chartSource = new VectorSource({
            features: chartFeatures,
            useSpatialIndex: true,
        });

        const chartLayer = new VectorLayer({
            source: chartSource,
            visible: layersVisible.wykresy,
            properties: {name: 'wykresy'}, // Nazwa do zarządzania
            zIndex: 4,
            renderBuffer: 150,
            updateWhileAnimating: false,
            updateWhileInteracting: false,
            style: (feature: FeatureLike) => {

                // Dane do wykresu są pobierane z właściwości (properties) obiektu
                const data = [
                    feature.get('dane1') || 0,
                    feature.get('dane2') || 0,
                    feature.get('dane3') || 0,
                    feature.get('dane4') || 0,
                ];


                return new Style({
                    image: new ChartStyle({
                        type: chartType,
                        data: data,
                        colors: ['#41b83b', '#e94d0b', '#5b4ce3', '#fa7cb1'],
                        radius: 15,
                        stroke: new Stroke({
                            color: [50, 50, 50, 0.8],
                            width: 2,
                        }),
                        fill: new Fill({
                            color: [255, 255, 255, 0.6],
                        }),
                    }),
                });
            },

        });

        // --- WARSTWA 3: Warstwa MASKI (Poligon zasłaniający świat poza granicami Polski) ---
        // Najprostszy poligon otaczający Polskę

        const wojewodztwaCoordinates = wojewodztwaGeoJSON.features
            .flatMap((feature: any) => {
                if (feature.geometry.type === 'Polygon') {
                    return [feature.geometry.coordinates[0]];
                } else if (feature.geometry.type === 'MultiPolygon') {
                    return feature.geometry.coordinates.map((poly: any) => poly[0]);
                }
                return [];
            });


        const maskGeometry = new GeoJSON().readFeature({
            type: 'Polygon',
            coordinates: [
                [
                    // Duży prostokąt obejmujący świat,
                    // z 'wycięciem' dla obszaru Polski (POLAND_EXTENT_4326)
                    [-180, -85], [-180, 85], [180, 85], [180, -85], [-180, -85]
                ],
                ...wojewodztwaCoordinates
            ]
        }, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
        });


        const maskSource = new VectorSource({
            // @ts-ignore
            features: [maskGeometry],
            useSpatialIndex: false,
        });

        const maskLayer = new VectorLayer({
            source: maskSource,
            properties: {name: 'maska'},
            style: new Style({
                fill: new Fill({color: 'rgba(255, 255, 255, 0.8)'}), // Biała maska
            }),
            zIndex: 1, // Ustawienie z-index na wyższy, by maska była na wierzchu OSM
            updateWhileAnimating: false,
            updateWhileInteracting: false,
        });

        // Użycie maski ol-ext jest bardziej zaawansowane. Ten prosty poligon jest łatwiejszy w implementacji.
        // Aby zablokować mapę do widoku Polski, użyjemy opcji 'extent' w View.

        return [chartLayer, lineLayer, voivodeshipVectorLayer, maskLayer];
    }, [layersVisible.linie, layersVisible.wojewodztwa, layersVisible.wykresy, chartType]);


    useEffect(() => {
        if (!mapRef.current) return;

        const layers = createLayers();
        // attribution controls on map
        const attributionInMap = new Attribution({
            collapsed: false,
            target: controlsAttributionId,
        });
        // scale controls on map
        const scaleLineControl = new ScaleLine({
            units: 'metric',
        });
        // zoom controls on map
        const zoomInMap = new Zoom({
            target: controlsZoomId,
        });

        // Inicjalizacja Mapy
        const initialMap = new Map({
            controls: defaultControls({attribution: false, rotate: false, zoom: false}).extend([
                attributionInMap,
                scaleLineControl,
                zoomInMap,
            ]),
            target: mapRef.current,
            layers: [
                new TileLayer({source: new OSM()}), // Warstwa bazowa OSM
                ...layers,
            ],
            view: new View({
                center: proj.fromLonLat([19.015839, 52.2307]),
                zoom: 6,
                extent: [
                    POLAND_EXTENT_3857[0] - 900000,  // Lewa krawędź
                    POLAND_EXTENT_3857[1] - 900000,  // Dolna krawędź
                    POLAND_EXTENT_3857[2] + 900000,  // Prawa krawędź
                    POLAND_EXTENT_3857[3] + 900000,  // Górna krawędź
                ],
                maxZoom: 14, // Ograniczenie maksymalnego zoomu
                minZoom: 5,
                constrainResolution: true, // Zablokowanie rozdzielczości poza zasięgiem
            }),

        });

        setMap(initialMap);

        return () => {
            initialMap.setTarget(undefined);
        };
    }, [createLayers]);

    // Efekt do obsługi przełączania widoczności warstw
    useEffect(() => {
        if (!map) return;

        map.getLayers().forEach(layer => {
            const name = layer.get('name');
            if (name === 'wojewodztwa') {
                layer.setVisible(layersVisible.wojewodztwa);
            } else if (name === 'linie') {
                layer.setVisible(layersVisible.linie);
            } else if (name === 'wykresy') {
                layer.setVisible(layersVisible.wykresy);
            }
        });
    }, [map, layersVisible]);


    // Handler do przełączania widoczności
    const handleToggleLayer = (layerName: keyof typeof layersVisible) => {
        setLayersVisible(prev => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    // Handler do zmiany typu wykresu
    const handleChartTypeChange = (event: SelectChangeEvent) => {
        setChartType(event.target.value as ChartType);
    };

    return (
        <MapStyles className="map-container" id={mapId}>
            <BoxStyles className="controls">
                <FormControlLabel control={<Checkbox
                    checked={layersVisible.wojewodztwa}
                    onChange={() => handleToggleLayer('wojewodztwa')}/>}
                                  label="Województwa (Wykresy)"/>
                <FormControlLabel required control={<Checkbox
                    checked={layersVisible.linie}
                    onChange={() => handleToggleLayer('linie')}/>}
                                  label="Linie"/>
                <FormControlLabel required control={<Checkbox
                    checked={layersVisible.wykresy}
                    onChange={() => handleToggleLayer('wykresy')}/>}
                                  label="Wykresy"/>
                <InputLabel id="typ_wykresu_label:"><Typography
                    data-test="selectorLabel"
                    sx={{
                        fontSize: '9px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word', // Ensures long words wrap
                        overflowWrap: 'break-word',
                    }}
                >Typ Wykresu:</Typography></InputLabel>
                <Select
                    labelId="typ_wykresu_label"
                    id="typ_wykresu_select"
                    value={chartType}
                    onChange={handleChartTypeChange}
                    disabled={!layersVisible.wykresy}
                    variant="standard"
                >
                    {CHART_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>
                    ))}
                </Select>
            </BoxStyles>
            <Typography sx={{marginTop: '5px', fontSize: 'small'}}>Warstwa maski jest zawsze włączona.</Typography>

            {/* Wymagane jest CSS do ustawienia wysokości i szerokości mapy */}
            <Box ref={mapRef}
                 style={{width: '100%', height: '80vh', position: 'relative'}} // ⬅️ DODAJ: position: 'relative'
                 id="chart-map">
                <Tooltip title={`${('Zoom')}`} placement="right" sx={{whiteSpace: 'pre-line'}}>
                    <ControlsZoom id={controlsZoomId}/>
                </Tooltip>
                <ControlCenterMap> {/* Wewnętrznie - pozycjonowane względem Box (mapy) */}
                    <Tooltip title={'Centrum'} placement="bottom-end" leaveDelay={200}>
                        <CenterMap onClick={handleCenterMap}/>
                    </Tooltip>
                </ControlCenterMap>
                <ControlsAttribution id={controlsAttributionId}/>
            </Box>
        </MapStyles>

    )
};
