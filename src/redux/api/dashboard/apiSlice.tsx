import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TDashboardGraph } from "@/types/TDashbaordGraph";
import { type TDashboardStat } from "@/types/TDashbaordStat";
import { type TDashboardStatParms } from "@/types/TDashboardStatParms";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardStatsApi = createApi({
  reducerPath: "dashboardStatsApi",
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
  tagTypes: ["State"],
  endpoints: (builder) => ({
    getStat: builder.query<TResponse<TDashboardStat>, TDashboardStatParms>({
      query: (params) => ({
        url: `/api/CustomDashboard/Stat`,
        method: "GET",
        params,
      }),
    }),
    getGraph: builder.query<TResponse<TDashboardGraph>, TDashboardStatParms>({
      query: (params) => ({
        url: `/api/CustomDashboard/GraphStats`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetStatQuery, useGetGraphQuery } = dashboardStatsApi;
