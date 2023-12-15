import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TManager } from "@/types/TManager";
import { type TResponse } from "@/types/TResponse";
import { type TTeamMember } from "@/types/TTeamMember";
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
  tagTypes: ["Team", "Managers", "TeamMembers"],
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
    getTeamMembers: builder.query<TResponse<TTeamMember[]>, void>({
      query: () => "/api/UserManagement/Subordinates",
      providesTags: ["TeamMembers"],
    }),
    addTeamMember: builder.mutation<TResponse<TTeamMember>, { email: string }>({
      query: (body) => ({
        url: `/api/UserManagement/Subordinates`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["TeamMembers"],
    }),
    updateTeamMember: builder.mutation<TResponse<TTeamMember>, unknown>({
      query: (body) => ({
        url: "/api/UserManagement/Subordinates",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["TeamMembers"],
    }),
    deleteTeamMember: builder.mutation<TResponse<unknown>, string>({
      query: (subordinateId) => ({
        url: `/api/UserManagement/Subordinates/${subordinateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TeamMembers"],
    }),
  }),
});

export const {
  useGetManagersQuery,
  useAddManagerMutation,
  useDeleteManagerMutation,
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamApi;
