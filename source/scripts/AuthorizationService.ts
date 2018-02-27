import bbox from "@turf/bbox";
import intersects from "@turf/boolean-intersects";

import { airspaceService } from ".";

export default class AuthorizationService {

    async authorize(
        shape: GeoJSON.Feature<GeoJSON.Polygon, { height: number }>,
    ): Promise<number[]> {

        const bounds = bbox(shape);

        const height = (shape.properties || { height: 0 }).height;

        const airspaces = await airspaceService.airspaces(
            bounds[0],
            bounds[1],
            bounds[2],
            bounds[3]);

        return airspaces.features
            .filter(_ => (_.properties || {}).layer === "YELLOW.USA.FAA_LAANC")
            .filter(_ => intersects(_, shape))
            .filter(_ => height > parseInt((_.properties || {}).ceiling) || 0)
            .map(_ => (_.properties || {}).featureId);
    }
}