import {
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
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
import {getCenter} from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import {register} from 'ol/proj/proj4';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import View from 'ol/View';
import proj4 from 'proj4';
import {type FC, useCallback, useEffect, useRef, useState} from 'react';
import {POLAND_EXTENT_3857, POLAND_EXTENT_4326} from '../common/poland-bbox'
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import {linieGeoJSON, wojewodztwaGeoJSON} from "../db/test.ts";
import {
    BoxStyles,
    ControlsAttribution,
    ControlsScale,
    ControlsScaleInner,
    ControlsZoom,
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


export const MapOsmPolandData: FC = () => {

    const mapRef = useRef<HTMLDivElement>(null);

    const [map, setMap] = useState<Map | null>(null);
    const [layersVisible, setLayersVisible] = useState({
        wojewodztwa: true,
        linie: true,
    });
    const [chartType, setChartType] = useState<ChartType>('bar');


    const [id] = useState(Math.random().toString(36).substring(7));
    const mapId = `map-${id}`;
    const controlsZoomId = `map-box-controls-zoom-${id}`;
    const controlsScaleInnerId = `map-box-controls-scale-${id}`;
    const controlsAttributionId = `map-box-controls-attribution-${id}`;

    // Używamy useCallback, aby stworzyć warstwy tylko raz
    const createLayers = useCallback(() => {

        // --- WARSTWA 1: Warstwa Linii (EPSG:2180) - Wydajność poprzez uproszczony styl ---
        const lineSource = new VectorSource({
            features: new GeoJSON().readFeatures(linieGeoJSON, {
                dataProjection: 'EPSG:2180',
                featureProjection: 'EPSG:3857',
            }),
        });

        const lineLayer = new VectorLayer({
            source: lineSource,
            visible: layersVisible.linie,
            properties: {name: 'linie'}, // Nazwa do zarządzania
            style: new Style({
                // Minimalistyczny styl dla płynności
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.7)',
                    width: 2,
                }),
            }),
        });

        // --- WARSTWA 2: Warstwa Województw (Wykresy ChartStyle, EPSG:4258) ---
        const chartSource = new VectorSource({
            features: new GeoJSON().readFeatures(wojewodztwaGeoJSON, {
                dataProjection: 'EPSG:4258',
                featureProjection: 'EPSG:3857',
            }),
        });

        const chartLayer = new VectorLayer({
            source: chartSource,
            visible: layersVisible.wojewodztwa,
            properties: {name: 'wojewodztwa'}, // Nazwa do zarządzania
            style: (feature) => {
                // Dane do wykresu są pobierane z właściwości (properties) obiektu
                const data = [
                    feature.get('data1') || 0,
                    feature.get('data2') || 0,
                    feature.get('data3') || 0,
                    feature.get('data4') || 0,
                ];

                return new Style({
                    image: new ChartStyle({
                        type: chartType,
                        data: data,
                        colors: ['#04a', '#a00', '#0a0', '#aa0'],
                        radius: 20,
                        stroke: new Stroke({
                            color: [255, 255, 255, 0.8],
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
        const maskGeometry = new GeoJSON().readFeature({
            type: 'Polygon',
            coordinates: [
                [
                    // Duży prostokąt obejmujący świat,
                    // z 'wycięciem' dla obszaru Polski (POLAND_EXTENT_4326)
                    [-180, -85], [-180, 85], [180, 85], [180, -85], [-180, -85]
                ],
                [
                    // "Otwór" (granice Polski)
                    [POLAND_EXTENT_4326[0], POLAND_EXTENT_4326[1]],
                    [POLAND_EXTENT_4326[0], POLAND_EXTENT_4326[3]],
                    [POLAND_EXTENT_4326[2], POLAND_EXTENT_4326[3]],
                    [POLAND_EXTENT_4326[2], POLAND_EXTENT_4326[1]],
                    [POLAND_EXTENT_4326[0], POLAND_EXTENT_4326[1]]
                ]
            ]
        }, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
        });

        const maskSource = new VectorSource({
            // @ts-ignore
            features: [maskGeometry]
        });

        const maskLayer = new VectorLayer({
            source: maskSource,
            properties: {name: 'maska'},
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 1)', // Biała, nieprzezroczysta maska
                }),
            }),
            zIndex: 10, // Ustawienie z-index na wyższy, by maska była na wierzchu OSM
        });

        // Użycie maski ol-ext jest bardziej zaawansowane. Ten prosty poligon jest łatwiejszy w implementacji.
        // Aby zablokować mapę do widoku Polski, użyjemy opcji 'extent' w View.

        return [lineLayer, chartLayer, maskLayer];
    }, [layersVisible.linie, layersVisible.wojewodztwa, chartType]);


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
            target: controlsScaleInnerId,
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
                center: getCenter(POLAND_EXTENT_3857),
                zoom: 3,
                // Blokada widoku do obszaru Polski
                extent: POLAND_EXTENT_3857,
                constrainResolution: true, // Zablokowanie rozdzielczości poza zasięgiem
            }),
        });

        setMap(initialMap);

        // --- LOGIKA ANIMACJI DLA LINII ---
        // Musimy znaleźć warstwę linii po jej nazwie
        const lineLayer = initialMap.getLayers().getArray()
            .find(layer => layer.get('name') === 'linie') as VectorLayer<VectorSource> | undefined;

        if (lineLayer) {
            // Rzutowanie lineLayer na 'any' tylko na czas wywołania metody animateFeature
            const animatableLayer = lineLayer as any;
            const lineSource = lineLayer.getSource();

            // Funkcja startująca animację po załadowaniu danych
            const startLineAnimation = () => {
                if (lineSource?.getState() === 'ready') {
                    lineSource?.getFeatures().forEach(feature => {
                        // Stwórz nową animację dla każdej linii
                        const animation = new PathAnimation({
                            duration: 2000, // Czas trwania animacji w ms
                            speed: 0, // Domyślnie używa duration
                            repeat: 1, // Liczba powtórzeń (1 oznacza jednorazowe rysowanie)
                            easing: 'linear',
                            // Opcjonalny styl animowanej linii (np. inny kolor, aby ją wyróżnić)
                            style: new Style({
                                stroke: new Stroke({
                                    color: 'blue',
                                    width: 4,
                                })
                            })
                        });

                        // Dodaj animację do warstwy
                        animatableLayer.animateFeature(feature, animation);
                    });

                    // Odłączamy nasłuchiwanie, aby animacja nie uruchamiała się przy każdym ruchu
                    lineSource.un('change', startLineAnimation);
                }
            };

            // Nasłuchuj na zdarzenie 'change' źródła, aby uruchomić animację
            lineSource?.once('change', startLineAnimation);
        }

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
                <FormGroup>
                    <FormControlLabel control={<Checkbox
                                                         checked={layersVisible.wojewodztwa}
                                                         onChange={() => handleToggleLayer('wojewodztwa')}/>}
                                      label="Województwa (Wykresy)"/>
                    <FormControlLabel required control={<Checkbox
                                                                  checked={layersVisible.linie}
                                                                  onChange={() => handleToggleLayer('linie')}/>}
                                      label="Linie"/>
                    <InputLabel id="typ_wykresu_label:">Typ Wykresu:</InputLabel>
                    <Select
                        labelId="typ_wykresu_label"
                        id="typ_wykresu_select"
                        value={chartType}
                        onChange={handleChartTypeChange}
                        disabled={!layersVisible.wojewodztwa}
                        variant="standard"
                    >
                        {CHART_TYPES.map(type => (
                            <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>
                        ))}
                    </Select>

                </FormGroup>
            </BoxStyles>
            <Tooltip title={`${('Zoom')}`} placement="right" sx={{whiteSpace: 'pre-line'}}>
                <ControlsZoom id={controlsZoomId}/>
            </Tooltip>
            <ControlsScale>
                <ControlsScaleInner id={controlsScaleInnerId}/>
            </ControlsScale>
            <ControlsAttribution id={controlsAttributionId}/>
            <Typography sx={{marginTop: '5px', fontSize: 'small'}}>Warstwa maski jest zawsze włączona.</Typography>
            {/* Wymagane jest CSS do ustawienia wysokości i szerokości mapy */}
            <Box ref={mapRef}
                 style={{width: '100%', height: '80vh'}}
                 id="chart-map"/>
        </MapStyles>

    )
};
