type Location = { lng: number, lat: number };

const earthRadius = 6371000;
export function move(location: Location, meters: number, bearing: number) {
    const angularDistance = meters / earthRadius;
    location = latLngToRadians(location);
    const lat2 = Math.asin(Math.sin(location.lat) * Math.cos(angularDistance) +
        Math.cos(location.lat) * Math.sin(angularDistance) * Math.cos(bearing));
    const lng2 = location.lng + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(location.lat),
        Math.cos(angularDistance) - Math.sin(location.lat) * Math.sin(lat2));
    return latLngToDegrees({ lat: lat2, lng: lng2 });
}


function latLngToRadians(location: Location): Location {
    return { lat: toRadians(location.lat), lng: toRadians(location.lng) };
}

function toRadians(degrees: number): number {
    return degrees / 180.0 * Math.PI;
}

function latLngToDegrees(location: Location): Location {
    return { lat: toDegrees(location.lat), lng: toDegrees(location.lng) };
}

function toDegrees(radians: number): number {
    return radians / Math.PI * 180.0;
}