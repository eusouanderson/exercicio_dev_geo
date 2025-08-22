import { apiFetch } from "./api";

export const getPoints = async (page = 1, limit = 100) => {
  return apiFetch(`/api/points?page=${page}&limit=${limit}`, {
    method: "GET",
  });
};

export const getPointById = async (id: string | number) => {
  return apiFetch(`/api/points/${id}`, {
    method: "GET",
  });
};
