import * as L from "leaflet";

export const createCustomMarker = (lat: number, lon: number, info?: string) => {
  const popupContent = info || `Lat: ${lat}, Lon: ${lon}`;

  const marker = L.marker([lat, lon], {}).bindPopup(popupContent);

  return marker;
};
