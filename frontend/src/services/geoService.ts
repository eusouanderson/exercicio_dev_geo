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

export const createGeoPoint = async (data: { lat: number; lon: number }) => {
  return apiFetch(`/api/geo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getGeoPointById = async (id: number) => {
  return apiFetch(`/api/geo/${id}`, {
    method: "GET",
  });
};

export const updateGeoPoint = async (
  id: number,
  data: { lat: number; lon: number }
) => {
  return apiFetch(`/api/geo/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const deleteGeoPoint = async (id: number) => {
  return apiFetch(`/api/geo/${id}`, {
    method: "DELETE",
  });
};
