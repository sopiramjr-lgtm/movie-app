import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1/admin",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Dashboard", "Movie", "Genre", "User", "Review", "Subscription", "Role"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<any, void>({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getMovies: builder.query<any, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/contents",
        params,
      }),
      providesTags: ["Movie"],
    }),
    getUsers: builder.query<any, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetMoviesQuery,
  useGetUsersQuery,
} = adminApi;
