import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TFinisher } from "@/types/TFinisher";
import { type TProfile } from "@/types/TProfile";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        const token = localStorage.getItem("token");
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Profile", "Finisher"],
  endpoints: (builder) => ({
    getProfile: builder.query<TResponse<TProfile>, void>({
      query: () => "/api/UserSettings/Profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<TResponse<TProfile>, TProfile>({
      query: (body) => ({
        url: "/api/UserSettings/Profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    changeProfileImage: builder.mutation<TResponse<TProfile>, FormData>({
      query: (body) => ({
        url: "/api/UserSettings/Profile/ChangeImage",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getFinisher: builder.query<TResponse<TFinisher>, void>({
      query: () => "/api/UserSettings/Finisher",
      providesTags: ["Finisher"],
    }),
    updateFinisher: builder.mutation<TResponse<TFinisher>, FormData>({
      query: (body) => ({
        url: "/api/UserSettings/Finisher",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Finisher"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangeProfileImageMutation,
  useGetFinisherQuery,
  useUpdateFinisherMutation,
} = profileApi;
