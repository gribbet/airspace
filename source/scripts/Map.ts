import * as mapbox from "mapbox-gl";
import Component from "wedges/lib/Component";

import { delay } from "./common";

export default class Map extends Component {
    private maps: mapbox.Map[] = [];

    render(element: Element) {
        const map = new mapbox.Map({
            container: element,
            style: "mapbox://styles/mapbox/light-v9"
        });
        this.maps.push(map);

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