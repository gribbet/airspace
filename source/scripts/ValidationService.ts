/// <reference types="geojson" />
import bbox from "@turf/bbox";
import difference from "@turf/difference";
import { polygon } from "@turf/helpers";
import unkink from "@turf/unkink-polygon";

import { airspaceService } from ".";


export default class AuthorizationService {

    async invalid(
        shape: GeoJSON.Feature<any, { height: number }>,
    ): Promise<GeoJSON.Feature<any>[]> {

        const bounds = bbox(shape);

        const height = (shape.properties || { height: 0 }).height;

        const airspaces = await airspaceService.airspaces(
            bounds[0],
            bounds[2],
            bounds[1],
            bounds[3]);

        const laanc = airspaces.features
            .filter(_ => (_.properties || {}).layer === "YELLOW.USA.FAA_LAANC");

        return laanc
            .filter(_ => height > parseInt((_.properties || {}).ceiling) || 0)
            .map(_ => intersection(_, shape))
            .filter(_ => _ !== null) as GeoJSON.Feature<GeoJSON.GeometryObject>[];
    }
}

// Hack since turf intersection is broken
function intersection(
    a: GeoJSON.Feature<any>,
    b: GeoJSON.Feature<any>
): GeoJSON.Feature<any> | null {

    const universe = polygon([[
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90]
    ]]);
    const inverse = unkink(b).features
        .reduce((inverse, b) =>
            difference(inverse, b) as GeoJSON.Feature<any>,
            universe);
    return difference(a, inverse);
}