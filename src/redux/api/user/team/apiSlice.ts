import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TManager } from "@/types/TManager";
import { type TResponse } from "@/types/TResponse";
import { type TSubordinate } from "@/types/TSubordinate";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teamApi = createApi({
  reducerPath: "teamApi",
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
  tagTypes: ["Team", "Managers", "Subordinates"],
  endpoints: (builder) => ({
    getManagers: builder.query<TResponse<TManager[]>, void>({
      query: () => "/api/UserManagement/Managers",
      providesTags: ["Managers"],
    }),
    addManager: builder.mutation<TResponse<TManager>, unknown>({
      query: (body) => ({
        url: "/api/UserManagement/Managers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Managers"],
    }),
    deleteManager: builder.mutation<TResponse<unknown>, string>({
      query: (managerId) => ({
        url: `/api/UserManagement/Managers/${managerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Managers"],
    }),
    getSubordinates: builder.query<TResponse<TSubordinate[]>, void>({
      query: () => "/api/UserManagement/Subordinates",
      providesTags: ["Subordinates"],
    }),
    addSubordinate: builder.mutation<
      TResponse<TSubordinate>,
      { email: string }
    >({
      query: (body) => ({
        url: `/api/UserManagement/Subordinates`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subordinates"],
    }),
    updateSubordinate: builder.mutation<TResponse<TSubordinate>, unknown>({
      query: (body) => ({
        url: "/api/UserManagement/Subordinates",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subordinates"],
    }),
    deleteSubordinate: builder.mutation<TResponse<unknown>, string>({
      query: (subordinateId) => ({
        url: `/api/UserManagement/Subordinates/${subordinateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subordinates"],
    }),
  }),
});

export const {
  useGetManagersQuery,
  useAddManagerMutation,
  useDeleteManagerMutation,
  useGetSubordinatesQuery,
  useAddSubordinateMutation,
  useUpdateSubordinateMutation,
  useDeleteSubordinateMutation,
} = teamApi;
