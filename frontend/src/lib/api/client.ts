import { ApiResponse } from "@/src/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Retrieve JWT from localStorage on client-side (exclude public auth endpoints)
  const isAuthEndpoint =
    endpoint.includes("/api/v1/auth/login") ||
    endpoint.includes("/api/v1/auth/signup") ||
    endpoint.includes("/api/v1/auth/forgot-password") ||
    endpoint.includes("/api/v1/auth/verify-email");

  if (typeof window !== "undefined" && !isAuthEndpoint) {
    const token = localStorage.getItem("access_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    let errorData: unknown = null;
    try {
      errorData = await response.json();
      if (errorData && typeof errorData === "object" && "message" in errorData) {
        errorMsg = String((errorData as { message: unknown }).message);
      }
    } catch {
      // Non-JSON error
    }

    if (response.status === 401) {
      if (typeof window !== "undefined" && !isAuthEndpoint) {
        localStorage.removeItem("access_token");
      }
      if (errorMsg.startsWith("HTTP Error")) {
        errorMsg = "Invalid email or password.";
      }
    }

    throw new ApiError(errorMsg, response.status, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  const json = await response.json();

  // If the backend wraps the result in standard ApiResponse { success: true, data: ... }
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return (json as ApiResponse<T>).data;
  }

  return json as T;
}
