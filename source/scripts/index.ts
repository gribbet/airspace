import * as mapbox from "mapbox-gl";
import Application from "wedges/lib/Application";

import Airspace from "./Airspace";
import AirspaceService from "./AirspaceService";
import AuthorizationService from "./AuthorizationService";

const mapboxToken = "pk.eyJ1IjoiZ3JhaGFtYWVyaWFsbGl2ZSIsImEiOiJjaXlnbjZlZmowM3dhMzJyd3BzMXo2am5wIn0.SIOs2eXS97bVJsRoTcuK-w";

(<any>mapbox).accessToken = mapboxToken;

export const airspaceService = new AirspaceService();

export const authorizationService = new AuthorizationService();

const application = new Application(
    new Airspace(),
    document.body);
application.start();
