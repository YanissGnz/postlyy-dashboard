import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { type TDashboardGraph } from "@/types/TDashbaordGraph";
import { type TDashboardStat } from "@/types/TDashbaordStat";
import { type TDashboardStatParams } from "@/types/TDashboardStatParams";
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
    getStat: builder.query<TResponse<TDashboardStat>, TDashboardStatParams>({
      query: (params) => ({
        url: `/api/CustomDashboard/Stat`,
        method: "GET",
        params,
      }),
    }),
    getGraph: builder.query<TResponse<TDashboardGraph>, TDashboardStatParams>({
      query: (params) => ({
        url: `/api/CustomDashboard/GraphStats`,
        method: "GET",
        params: {
          ...params,
          ...Object.fromEntries(
            params.userIds?.map((userId, i) => [`userIds[${i}]`, userId]) ?? [],
          ),
        },
      }),
    }),
    getTodayCalendarEvents: builder.query<TResponse<TCalendarEvent[]>, void>({
      query: () => ({
        url: `/api/CustomDashboard/TodayCalendarEvents`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetStatQuery,
  useGetGraphQuery,
  useGetTodayCalendarEventsQuery,
} = dashboardStatsApi;
