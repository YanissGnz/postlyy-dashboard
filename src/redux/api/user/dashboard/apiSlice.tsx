import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type DashboardConfig } from "@/types/TDashboardConfig";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
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
  tagTypes: ["DashboardConfig"],
  endpoints: (builder) => ({
    getDashboardConfig: builder.query<TResponse<DashboardConfig[]>, void>({
      query: () => "/api/UserSettings/Dashboard",
      transformResponse: (response: TResponse<string>) => {
        return {
          ...response,
          data: JSON.parse(response.data) as DashboardConfig[],
        };
      },
      providesTags: ["DashboardConfig"],
    }),
    changeDashboardConfig: builder.mutation<void, DashboardConfig[]>({
      query: (body) => ({
        url: "/api/UserSettings/Dashboard",
        method: "PUT",
        body: {
          dashboard: JSON.stringify(body),
        },
      }),
      invalidatesTags: ["DashboardConfig"],
    }),
  }),
});

export const { useGetDashboardConfigQuery, useChangeDashboardConfigMutation } =
  dashboardApi;
