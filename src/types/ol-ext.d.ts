import Geometry from 'ol/geom/Geometry';

declare module 'ol-ext/layer/Chart' {
    const ChartLayer: any;
    export default ChartLayer;
}
declare module 'ol-ext/style/Chart' {
    const ChartStyle: any;
    export default ChartStyle;
    export const chart: any;
}

declare module '*.geojson' {
    interface GeoJsonFeature {
        type: 'Feature';
        geometry: {
            type: string;
            coordinates: any[];
        };
        properties: Record<string, any>;
    }

    interface GeoJsonFeatureCollection {
        type: 'FeatureCollection';
        features: GeoJsonFeature[];
    }

    const content: GeoJsonFeatureCollection;
    export default content;
}

// Musimy zaimportować i zadeklarować typ Animation z ol-ext
declare module 'ol-ext/featureAnimation/Animation' {
    export default class Animation {
        constructor(options?: any);
        // Dodaj inne metody, jeśli ich używasz, np. start, stop
    }
}

// Rozszerzenie standardowego interfejsu VectorLayer
declare module 'ol/layer/Vector' {
    interface VectorLayer<VectorSource, Feature extends Feature<Geometry>> {
        /**
         * Metoda dodana przez ol-ext do uruchamiania animacji na obiekcie.
         * @param feature Obiekt (Feature) do animacji.
         * @param animation Instancja animacji (np. LineStringAnimation).
         * @param options Dodatkowe opcje.
         */
        animateFeature(
            feature: Feature<Geometry>,
            animation: import('ol-ext/featureAnimation/Animation').default,
            options?: any
        ): void;
    }
}
declare module "ol-ext/featureAnimation/LineString" {
    import Animation from 'ol-ext/featureAnimation/Animation';
    export default class LineStringAnimation extends Animation {}
}

declare module "ol-ext/featureAnimation/Animation" {
    export default class Animation {
        constructor(options?: any);
    }
}

declare module "ol-ext/style/Chart" {
    import Style from 'ol/style/Style';
    export default class ChartStyle extends Style {
        constructor(options?: any);
    }
}

declare module "ol-ext/filter/Mask" {
    import Filter from 'ol-ext/filter/Filter';
    export default class Mask extends Filter {
        constructor(options?: any);
    }
}

declare module "ol-ext/featureAnimation/Path" {
    import Animation from 'ol-ext/featureAnimation/Animation';
    export default class PathAnimation extends Animation {}
}
