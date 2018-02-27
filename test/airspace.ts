import "mocha";

import { assert } from "chai";

import AirspaceService from "../source/scripts/AirspaceService";

describe("Airspace service tests", () => {

    it("should return results for Portland", async () => {

        const airspaceService = new AirspaceService();

        const airspaces = await airspaceService.airspaces(-123, -122, 45, 46);

        assert(airspaces.features.length > 0, "airspaces is not empty");
    });
});