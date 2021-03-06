import * as mapbox from "mapbox-gl";
import Component from "wedges/lib/Component";

import { airspaceService, flightValidationService } from ".";


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

    let height: number = 280;
    let vertices: [number, number][] = [];
    let drawing = false;

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

        map.on("mousemove", (event: any) => {

            if (!drawing)
                return;

            const position = event.lngLat;

            const last = vertices.length > 0 ? vertices[0] : null;
            if (last !== null
                && last[0] === position.lng
                && last[1] === position.lat)
                return;

            vertices.unshift([position.lng, position.lat]);

            updateShape();
        });

        map.on("click", () => {
            drawing = !drawing;
            if (drawing)
                vertices = [];
            else
                updateInvalid();
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
    }

    function updateShape() {
        const source = map.getSource("shape") as mapbox.GeoJSONSource;
        source.setData(shape());
    }

    async function updateInvalid() {

        const invalid = await flightValidationService.invalidAirspaces(shape());

        const source = map.getSource("invalid") as mapbox.GeoJSONSource;
        source.setData({
            "type": "FeatureCollection",
            "features": invalid
        });
    }

    function shape(): GeoJSON.Feature<GeoJSON.Polygon, { height: number }> {
        return {
            "type": "Feature",
            "properties": {
                "height": height
            },
            "geometry": {
                "type": "Polygon",
                "coordinates":
                    vertices.length === 0
                        ? []
                        : [vertices.concat([vertices[0]])]
            }
        };
    }

    // map.getBounds() is broken with a .pitch unfortunately
    function boundsWithPitch(): mapbox.LngLatBounds {

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
        map.addSource("invalid", {
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
                "properties": {
                    "height": 0
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[
                    ]]]
                }
            }
        });

        const heightFactor = 3;
        const base = ["*", heightFactor, ["to-number", ["get", "floor"], 0]];
        const height = [
            "-",
            ["*", heightFactor, ["to-number", ["get", "ceiling"], 0]],
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
            "minzoom": 9,
            "layout": {
                "text-field": "{ceiling}",
                "text-size": 12,
            }
        });
        map.addLayer({
            "id": "invalid-extrusion",
            "source": "invalid",
            "type": "fill-extrusion",
            "paint": {
                "fill-extrusion-color": "#ff0000",
                "fill-extrusion-height": ["+", 10, height], // Add an offset to improve rendering
                "fill-extrusion-base": base,
                "fill-extrusion-opacity": 0.6
            }
        });
        map.addLayer({
            "id": "shape-outline",
            "source": "shape",
            "type": "line",
            "paint": {
                "line-width": 5,
                "line-opacity": 0.25,
                "line-color": "#3333ee"
            }
        });
        map.addLayer({
            "id": "shape-extrusion",
            "source": "shape",
            "type": "fill-extrusion",
            "paint": {
                "fill-extrusion-color": "#3333ee",
                "fill-extrusion-height": ["*", heightFactor, ["get", "height"]],
                "fill-extrusion-opacity": 0.2
            }
        });
        map.addLayer({
            "id": "airspaces-extrusion-other",
            "source": "airspaces",
            "type": "fill-extrusion",
            "filter": ["!=", ["get", "layer"], "YELLOW.USA.FAA_LAANC"],
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



