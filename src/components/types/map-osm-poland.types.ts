import type Point from "ol/geom/Point";


export type ChartData = {
    geometry: Point;
    data: number[];
    size: number;
}

export type StyleCacheKey = {
    graph: string;
    color: string;
    selected: boolean;
    data: string;
}

export const CHART_TYPES = ['bar', 'pie', 'donut'] as const;
export type ChartType = typeof CHART_TYPES[number];
