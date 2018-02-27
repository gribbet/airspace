/// <reference types="geojson" />
import bbox from "@turf/bbox";

import { airspaceService } from ".";
import { intersection } from "./geometry";


export default class FlightValidationService {

    async invalidAirspaces(
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