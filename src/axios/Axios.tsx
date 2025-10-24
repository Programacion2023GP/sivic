import axios from "axios";

// Instancia para peticiones normales (JSON)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});

// Interceptor: agregar token dinámico
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Instancia para archivos (multipart/form-data)
const AxiosFiles = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  responseType: "json",
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
});

AxiosFiles.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || "";
    if (!config.headers) config.headers = new axios.AxiosHeaders();

    config.headers.set("Authorization", `Bearer ${token}`);
    config.headers.set("Content-Type", "multipart/form-data");

    return config;
  },
  (error) => Promise.reject(error)
);

// GET genérico
export const GetAxios = async (url: string) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error en la solicitud:", error);
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
  }
};

// 🧩 AxiosRequest mejorado: usa AxiosFiles si detecta archivos
export const AxiosRequest = async (
  url: string,
  method: "POST" | "PUT" | "DELETE",
  values?: Record<string, any> | FormData
) => {
  try {
    // Detectar si es FormData
    const isFormData =
      values instanceof FormData ||
      Object.values(values || {}).some((v) => v instanceof File || v instanceof Blob);

    // Seleccionar la instancia correcta
    const instance = isFormData ? AxiosFiles : axiosInstance;

    let response;

    switch (method) {
      case "POST":
        response = await instance.post(url, values);
        break;
      case "PUT":
        response = await instance.put(url, values);
        break;
      case "DELETE":
        response = await instance.delete(url, { data: values });
        break;
      default:
        throw new Error("Método no soportado");
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    } else {
      console.error("Error en AxiosRequest:", error);
      return error.response?.data || { message: "Error desconocido" };
    }
  }
};
