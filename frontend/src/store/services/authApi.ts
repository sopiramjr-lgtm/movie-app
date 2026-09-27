import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User, UserProfile } from "@/src/types/user";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => "/me",
      providesTags: ["User"],
    }),
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `/profile/${userId}`,
      providesTags: ["User"],
    }),
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (body) => ({
        url: "/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = authApi;
