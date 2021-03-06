/// <reference types="geojson" />
import "isomorphic-fetch";

import bbox from "@turf/bbox";

import AirspaceService from "./AirspaceService";
import { intersection } from "./geometry";


export default class FlightValidationService {

    constructor(
        private airspaceService: AirspaceService
    ) { }

    /**
     * Query for conflicting LAANC airspace for a specific flight volume
     */
    async invalidAirspaces(
        shape: GeoJSON.Feature<any, { height: number }>,
    ): Promise<GeoJSON.Feature<any>[]> {

        const bounds = bbox(shape);

        const height = (shape.properties || { height: 0 }).height;

        const laanc = await this.airspaceService.laanc(
            bounds[0],
            bounds[2],
            bounds[1],
            bounds[3]);

        return laanc.features
            .filter(_ => height > parseInt((_.properties || {}).ceiling) || 0)
            .map(_ => intersection(_, shape))
            .filter(_ => _ !== null) as GeoJSON.Feature<GeoJSON.GeometryObject>[];
    }
}