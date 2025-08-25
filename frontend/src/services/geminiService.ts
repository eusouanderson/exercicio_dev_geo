import { apiFetch } from "./api";

export const sendGeminiPrompt = async (prompt: string) => {
  return apiFetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });
};

export const listGeminiResults = async () => {
  return apiFetch("/api/gemini/results", {
    method: "GET",
  });
};

export const getGeminiResultById = async (id: number) => {
  return apiFetch(`/api/gemini/results/${id}`, {
    method: "GET",
  });
};

export const updateGeminiResult = async (
  id: number,
  data: { result?: string; prompt?: string }
) => {
  return apiFetch(`/api/gemini/results/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const deleteGeminiResult = async (id: number) => {
  return apiFetch(`/api/gemini/results/${id}`, {
    method: "DELETE",
  });
};
