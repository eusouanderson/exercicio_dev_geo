import { API_BASE_URL } from "@/config";

export const fetchPoints = async (page = 1, limit = 1000, minCount = 0) => {
  const response = await fetch(
    `${API_BASE_URL}/points?page=${page}&limit=${limit}&minCount=${minCount}`
  );
  if (!response.ok) throw new Error("Falha ao carregar pontos");
  return response.json();
};

export const fetchPolygonOperations = async (data: {
  polygon: number[][];
  operation: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/polygon/operations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Falha na operação do polígono");
  return response.json();
};

export const fetchOSMReverse = async (lat: number, lon: number) => {
  const response = await fetch(
    `${API_BASE_URL}/osm/reverse?lat=${lat}&lon=${lon}`
  );
  if (!response.ok) throw new Error("Falha na consulta OSM");
  return response.json();
};
