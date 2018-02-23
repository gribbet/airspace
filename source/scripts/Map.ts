import * as mapbox from "mapbox-gl";
import Component from "wedges/lib/Component";

import { airspaceService } from ".";
import { delay } from "./common";

export default class Map extends Component {
    private maps: mapbox.Map[] = [];
    private shape: [number, number][] = [];

    render(element: Element) {
        const map = new mapbox.Map({
            container: element,
            style: "mapbox://styles/mapbox/light-v9",
            center: [-122.6765, 45.5231],
            zoom: 10,
            pitch: 45
        });
        this.maps.push(map);

        const updateAirspaces = async () => {
            const bounds = map.getBounds();

            const airspaces = await airspaceService.airspaces(
                bounds.getWest(),
                bounds.getEast(),
                bounds.getSouth(),
                bounds.getNorth());

            const source = map.getSource("airspaces") as mapbox.GeoJSONSource;

            source.setData(airspaces);
        };

        const updateShape = () => {
            const source = map.getSource("shape") as mapbox.GeoJSONSource;
            const shape = this.shape.slice();
            if (this.shape.length > 0)
                shape.concat(this.shape[0]).concat(this.shape[0]);
            source.setData({
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [shape]
                }
            });
        }

        map.on("load", () => {
            style(map);
            map.on("moveend", updateAirspaces);
            map.on("click", (event: any) => {
                const position = event.lngLat;
                this.shape.push([position.lng, position.lat]);
                updateShape();
            });
            map.on("contextmenu", () => {
                this.shape = [];
                updateShape();
            });
            updateAirspaces();
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

function style(map: mapbox.Map) {
    map.addSource("airspaces", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });
    map.addSource("shape", {
        "type": "geojson",
        "data": {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[
                ]]]
            }
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
        "id": "airspaces-extrusion-red",
        "source": "airspaces",
        "type": "fill-extrusion",
        "filter": ["==", ["get", "layer"], "RED.USA"],
        "paint": {
            "fill-extrusion-color": "#ee3333",
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
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["-", ["get", "ceiling"], ["get", "floor"]],
            "fill-extrusion-base": ["get", "floor"],
            "fill-extrusion-opacity": 0.33
        }
    });
    map.addLayer({
        "id": "airspaces-outline",
        "source": "airspaces",
        "type": "line",
        "paint": {
            "line-width": 1,
            "line-opacity": 0.05
        }
    });
    map.addLayer({
        "id": "airspaces-labels",
        "source": "airspaces",
        "type": "symbol",
        "filter": ["==", ["get", "layer"], "YELLOW.USA.FAA_LAANC"],
        "layout": {
            "text-field": "{ceiling}",
            "text-size": 12,
        }
    });

    map.addLayer({
        "id": "shape-extrusion",
        "source": "shape",
        "type": "fill-extrusion",
        "paint": {
            "fill-extrusion-color": "#33ee33",
            "fill-extrusion-height": 300,
            "fill-extrusion-opacity": 0.8
        }
    });
    map.addLayer({
        "id": "shape-outline",
        "source": "shape",
        "type": "line",
        "paint": {
            "line-width": 5,
            "line-opacity": 0.25,
            "line-color": "#33ee33"
        }
    });
}