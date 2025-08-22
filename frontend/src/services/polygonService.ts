import { apiFetch } from "./api";

export const listPolygons = async () => {
  return apiFetch("/api/polygons", {
    method: "GET",
  });
};

export const getPolygon = async (id: number) => {
  return apiFetch(`/api/polygons/${id}`, {
    method: "GET",
  });
};

export const createPolygon = async (data: {
  name: string;
  coordinates: number[][];
  pointsInside: number[];
}) => {
  return apiFetch("/api/polygons", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updatePolygon = async (
  id: number,
  data: { name: string; coordinates: number[][]; pointsInside: number[] }
) => {
  return apiFetch(`/api/polygons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deletePolygon = async (id: number) => {
  return apiFetch(`/api/polygons/${id}`, {
    method: "DELETE",
  });
};
