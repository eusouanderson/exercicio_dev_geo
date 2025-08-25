import { API_BASE_URL, TEST_TOKEN } from "@/config";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("authToken") || TEST_TOKEN;
  if (!token) return {};
  return { Authorization: token };
};

const handleResponse = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    console.error("API Error:", response.status, text);
    throw new Error(text || `Erro na requisição: ${response.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  });

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value) headers.set(key, value);
      });
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  // console.log("API Fetch -> URL:", url);
  // console.log("API Fetch -> Headers:", Object.fromEntries(headers.entries()));

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(response);
};
