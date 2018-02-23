type Location = [number, number];

const earthRadius = 6371000;
export function move(location: Location, meters: number, bearing: number) {
    const angularDistance = meters / earthRadius;
    const [lng, lat] = location.map(toRadians);
    const lat2 = Math.asin(Math.sin(lng) * Math.cos(angularDistance) +
        Math.cos(lat) * Math.sin(angularDistance) * Math.cos(bearing));
    const lng2 = lng + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat),
        Math.cos(angularDistance) - Math.sin(lat) * Math.sin(lat2));
    return [toDegrees(lng), toDegrees(lat)];
}

function toRadians(degrees: number): number {
    return degrees / 180.0 * Math.PI;
}

function toDegrees(radians: number): number {
    return radians / Math.PI * 180.0;
}