import difference from "@turf/difference";
import { polygon } from "@turf/helpers";
import unkink from "@turf/unkink-polygon";


// Hack since Turf intersection is broken
export function intersection(
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