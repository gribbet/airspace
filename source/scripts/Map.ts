import * as mapbox from "mapbox-gl";
import Component from "wedges/lib/Component";

import { airspaceService } from ".";
import { delay } from "./common";

export default class Map extends Component {
    private maps: mapbox.Map[] = [];

    render(element: Element) {
        const map = new mapbox.Map({
            container: element,
            style: "mapbox://styles/mapbox/light-v9",
            center: [-122.6765, 45.5231],
            zoom: 10,
            pitch: 45
        });
        this.maps.push(map);

        map.on("load", () => {

            map.addSource("airspaces", {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            });
            map.addLayer({
                "id": "airspaces-extrusion-red",
                "source": "airspaces",
                "type": "fill-extrusion",
                "filter": ["==", ["get", "layer"], "RED.USA"],
                "paint": {
                    "fill-extrusion-color": "#ee7777",
                    "fill-extrusion-height": ["-", ["get", "ceiling"], ["get", "floor"]],
                    "fill-extrusion-base": ["get", "floor"],
                    "fill-extrusion-opacity": 0.6
                }
            });
            map.addLayer({
                "id": "airspaces-extrusion-laanc",
                "source": "airspaces",
                "type": "fill-extrusion",
                "filter": ["==", ["get", "layer"], "YELLOW.USA.FAA_LAANC"],
                "paint": {
                    "fill-extrusion-color": "#eeee77",
                    "fill-extrusion-height": ["-", ["get", "ceiling"], ["get", "floor"]],
                    "fill-extrusion-base": ["get", "floor"],
                    "fill-extrusion-opacity": 0.6
                }
            });
            map.addLayer({
                "id": "airspaces-extrusion-other",
                "source": "airspaces",
                "type": "fill-extrusion",
                "filter": ["all",
                    ["!=", ["get", "layer"], "YELLOW.USA.FAA_LAANC"],
                    ["!=", ["get", "layer"], "RED.USA"]],
                "paint": {
                    "fill-extrusion-color": "#eeee77",
                    "fill-extrusion-height": ["-", ["get", "ceiling"], ["get", "floor"]],
                    "fill-extrusion-base": ["get", "floor"],
                    "fill-extrusion-opacity": 0.6
                }
            });
            map.addLayer({
                "id": "airspaces-lines",
                "source": "airspaces",
                "type": "line",
                "paint": {
                    "line-width": 1,
                    "line-opacity": 0.2
                }
            });
            map.on("moveend", async () => {

                const bounds = map.getBounds();

                const airspaces = await airspaceService.airspaces(
                    bounds.getWest(),
                    bounds.getEast(),
                    bounds.getSouth(),
                    bounds.getNorth());

                const source = map.getSource("airspaces") as mapbox.GeoJSONSource;

                source.setData(airspaces);
            });
        });

        return {
            update: () => { },
            destroy: () => {
                map.remove();
                this.maps = this.maps.filter(_ => _ !== map);
            }
        }
    }

    async load() {
        const check = async (map: mapbox.Map) => {
            if (map.loaded())
                return true;
            await delay(50);
            await check(map);
        };
        await Promise.all(this.maps.map(_ => check(_)));
    }
}