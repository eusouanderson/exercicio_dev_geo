import { apiFetch } from "./api";

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
