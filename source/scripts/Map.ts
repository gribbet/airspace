import * as mapbox from "mapbox-gl";
import Component from "wedges/lib/Component";

import { airspaceService } from ".";

export default class Map extends Component {

    render(element: Element) {
        const map = createMap(element);

        return {
            update: () => { },
            destroy: () =>
                map.remove()
        }
    }
}

function createMap(element: Element): mapbox.Map {

    let shape: [number, number][] = [];

    const map = new mapbox.Map({
        container: element,
        style: "mapbox://styles/mapbox/light-v9",
        center: [-122.6765, 45.5231],
        zoom: 10,
        pitch: 45
    });

    map.on("load", () => {
        style();
        map.on("moveend", updateAirspaces);
        map.on("click", (event: any) => {
            const position = event.lngLat;
            shape.push([position.lng, position.lat]);
            updateShape();
        });
        map.on("contextmenu", () => {
            shape = [];
            updateShape();
        });
        updateAirspaces();
    });

    async function updateAirspaces() {
        const bounds = boundsWithPitch();

        const airspaces = await airspaceService.airspaces(
            bounds.getWest(),
            bounds.getEast(),
            bounds.getSouth(),
            bounds.getNorth());

        const source = map.getSource("airspaces") as mapbox.GeoJSONSource;

        source.setData(airspaces);
    };

    function updateShape() {
        const source = map.getSource("shape") as mapbox.GeoJSONSource;
        let vertices = shape.slice();
        if (vertices.length > 0)
            vertices = vertices.concat([shape[0]]);
        source.setData({
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [vertices]
            }
        });
    }

    function boundsWithPitch(): mapbox.LngLatBounds {
        // map.getBounds() is broken with a .pitch unfortunately
        const canvas = map.getCanvas();
        const rect = canvas.getBoundingClientRect();
        return [
            [rect.left, rect.top],
            [rect.left, rect.bottom],
            [rect.right, rect.bottom],
            [rect.right, rect.top]
        ]
            .map(_ => map.unproject(_))
            .reduce(
                (bounds, point) => bounds.extend(point),
                new mapbox.LngLatBounds());
    }

    function style() {
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

        const factor = 2;
        const base = ["*", factor, ["to-number", ["get", "floor"], 0]];
        const height = [
            "-",
            ["*", factor, ["to-number", ["get", "ceiling"], 0]],
            base
        ];

        map.addLayer({
            "id": "airspaces-extrusion-laanc",
            "source": "airspaces",
            "type": "fill-extrusion",
            "filter": ["==", ["get", "layer"], "YELLOW.USA.FAA_LAANC"],
            "paint": {
                "fill-extrusion-color": "#eeee77",
                "fill-extrusion-height": height,
                "fill-extrusion-base": base,
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
                "fill-extrusion-height": height,
                "fill-extrusion-base": base,
                "fill-extrusion-opacity": 0.6
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
                "fill-extrusion-height": 280,
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

        map.addLayer({
            "id": "airspaces-extrusion-other",
            "source": "airspaces",
            "type": "fill-extrusion",
            "filter": ["all",
                ["!=", ["get", "layer"], "YELLOW.USA.FAA_LAANC"],
                ["!=", ["get", "layer"], "RED.USA"]],
            "paint": {
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": height,
                "fill-extrusion-base": base,
                "fill-extrusion-opacity": 0.33
            }
        });
    }

    return map;
}



