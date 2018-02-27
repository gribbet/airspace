import "mocha";

import { assert } from "chai";

import AirspaceService from "../source/scripts/AirspaceService";
import FlightValidationService from "../source/scripts/FlightValidationService";

describe("Flight validation service tests", () => {

    it("downtown Portland flight at 300ft should be valid", async () => {

        const invalid = await downtownPortlandInvalidFeaturesForHeight(300);

        assert(invalid.length === 0, "invalid features is empty");
    });

    it("downtown Portland flight at 500ft should be invalid", async () => {

        const invalid = await downtownPortlandInvalidFeaturesForHeight(500);

        assert(invalid.length > 0, "invalid features is not empty");
    });
});

async function downtownPortlandInvalidFeaturesForHeight(
    height: number
): Promise<GeoJSON.Feature<any>[]> {

    const airspaceService = new AirspaceService();

    const flightValidationService = new FlightValidationService(airspaceService);

    return await flightValidationService.invalidAirspaces({
        "type": "Feature",
        "properties": {
            "height": height
        },
        "geometry": downtownPortland
    });
}

const downtownPortland = {
    "type": "MultiPolygon",
    "coordinates": [[[
        [-122.6889, 45.513982],
        [-122.687609, 45.516036],
        [-122.686709, 45.517736],
        [-122.685173, 45.522055],
        [-122.685588, 45.522765],
        [-122.68485, 45.52275],
        [-122.67716, 45.52285],
        [-122.67301, 45.5229],
        [-122.67301, 45.5224],
        [-122.6731, 45.52217],
        [-122.67345, 45.52149],
        [-122.67255, 45.52124],
        [-122.67292, 45.52052],
        [-122.67197, 45.52026],
        [-122.67228, 45.51965],
        [-122.671055, 45.519318],
        [-122.671609, 45.518236],
        [-122.669398, 45.517663],
        [-122.671401, 45.513041],
        [-122.668477, 45.507582],
        [-122.670709, 45.506436],
        [-122.674318, 45.505145],
        [-122.676709, 45.5051],
        [-122.680109, 45.505836],
        [-122.683609, 45.507336],
        [-122.686809, 45.509736],
        [-122.688855, 45.512436],
        [-122.6889, 45.513982]]]]
};