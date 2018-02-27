import * as mapbox from "mapbox-gl";
import Application from "wedges/lib/Application";

import AirspaceApp from "./AirspaceApp";
import AirspaceService from "./AirspaceService";
import FlightValidationService from "./FlightValidationService";


const mapboxToken = "pk.eyJ1IjoiZ3JhaGFtYWVyaWFsbGl2ZSIsImEiOiJjaXlnbjZlZmowM3dhMzJyd3BzMXo2am5wIn0.SIOs2eXS97bVJsRoTcuK-w";

(<any>mapbox).accessToken = mapboxToken;

export const airspaceService = new AirspaceService();

export const flightValidationService =
    new FlightValidationService(airspaceService);

export const application = new Application(
    new AirspaceApp(),
    document.body);
application.start();
