import * as mapbox from "mapbox-gl";
import Application from "wedges/lib/Application";

import Airspace from "./Airspace";

const mapboxToken = "pk.eyJ1IjoiZ3JhaGFtYWVyaWFsbGl2ZSIsImEiOiJjaXlnbjZlZmowM3dhMzJyd3BzMXo2am5wIn0.SIOs2eXS97bVJsRoTcuK-w";

(<any>mapbox).accessToken = mapboxToken;

const application = new Application(new Airspace(), document.body);
application.start();
