/// <reference types="geojson" />
import "isomorphic-fetch";

import * as QueryString from "query-string";

import { range } from "./common";
import { move } from "./mapping";


type Features = GeoJSON.FeatureCollection<any>;

export default class AirspaceService {

    async airspaces(
        west: number,
        east: number,
        south: number,
        north: number
    ): Promise<Features> {

        const url = "https://sureflight.skyward.io/api/0.6.0/airspace/rect";
        const key = "add06589-27e2-4668-a1d7-e61181978345";

        const query = QueryString.stringify({
            xMin: west,
            xMax: east,
            yMin: south,
            yMax: north,
            layers: ""
        });

        const response = await fetch(
            `${url}?${query}`, {
                headers: new Headers({
                    "Authorization": key
                })
            });

        const features = await response.json() as Features;

        return convert(features);
    }
}

function convert(features: Features): Features {

    features.features = features.features.map(feature => {

        const geometry = feature.geometry;

        if (!geometry)
            return feature;

        // Question: Hmmm... that's not GeoJSON
        if (geometry.type === "Circle")
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": range(0, 100)
                        .map(i => i / 100 * 2 * Math.PI)
                        .map(bearing => move(
                            geometry.center,
                            geometry.radius,
                            bearing))
                },
                "properties": feature.properties
            } as GeoJSON.Feature<any>;

        return feature;
    });

    return features;
}