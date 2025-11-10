// fit map to jurisdition layer
import Map from 'ol/Map';
import * as proj from 'ol/proj';
import View from "ol/View";

export const fitMapToJurisditionLayerExtent = (map: Map) => {
        const v = new View({
            center: proj.fromLonLat([19.015839, 52.2307]),
            zoom: 6.5,
        });
        map.setView(v);
};
