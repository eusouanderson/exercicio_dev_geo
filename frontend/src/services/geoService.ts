import { apiFetch } from "./api";

//Preciso colocar o custom layer aqui !
export const listGeoPoints = async () => {
  return apiFetch("/api/geo", {
    method: "GET",
  });
};

export const reverseGeo = async (lat: number, lon: number) => {
  return apiFetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`, {
    method: "GET",
  });
};

export const createGeoPoint = async (data: { lat: number; lon: number }) => {
  return apiFetch(`/api/geo/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
