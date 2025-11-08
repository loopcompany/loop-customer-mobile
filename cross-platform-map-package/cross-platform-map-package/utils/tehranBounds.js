export const TEHRAN_CENTER = { latitude: 35.7219, longitude: 51.3347 };

export const TEHRAN_BOUNDS = {
    minLatitude: 35.3,
    maxLatitude: 35.9,
    minLongitude: 50.7,
    maxLongitude: 51.9,
};

const parseCoordinate = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};

const clamp = (value, min, max) => {
    if (!Number.isFinite(value)) {
        return null;
    }
    return Math.min(Math.max(value, min), max);
};

export const isWithinTehran = (latitude, longitude) => {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);

    if (lat === null || lng === null) {
        return false;
    }

    return (
        lat >= TEHRAN_BOUNDS.minLatitude &&
        lat <= TEHRAN_BOUNDS.maxLatitude &&
        lng >= TEHRAN_BOUNDS.minLongitude &&
        lng <= TEHRAN_BOUNDS.maxLongitude
    );
};

export const sanitizeToTehran = (latitude, longitude) => {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);

    if (lat === null || lng === null) {
        return { ...TEHRAN_CENTER, isFallback: true };
    }

    const clampedLat = clamp(lat, TEHRAN_BOUNDS.minLatitude, TEHRAN_BOUNDS.maxLatitude);
    const clampedLng = clamp(lng, TEHRAN_BOUNDS.minLongitude, TEHRAN_BOUNDS.maxLongitude);

    const isFallback = clampedLat !== lat || clampedLng !== lng;

    return {
        latitude: clampedLat ?? TEHRAN_CENTER.latitude,
        longitude: clampedLng ?? TEHRAN_CENTER.longitude,
        isFallback,
    };
};
