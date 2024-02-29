import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type TSelfRetweet } from "@/types/TSelfRetweet";
import { type TPowerups } from "@/types/TPowerups";
import { type EProviders } from "@/types/EProviders";

export const powerupsApi = createApi({
  reducerPath: "powerupsApi",
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
  tagTypes: ["Powerups"],
  endpoints: (builder) => ({
    getPowerups: builder.query<TResponse<TPowerups>, string>({
      query: (accountId) => `/api/UserSettings/PowerUps/${accountId}`,
      providesTags: ["Powerups"],
    }),
    updateAutoPlug: builder.mutation<
      TResponse<unknown>,
      {
        accountId: string;
        body: FormData;
      }
    >({
      query: ({ accountId, body }) => ({
        url: `/api/UserSettings/PowerUps/${accountId}/AutoPlug`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Powerups"],
    }),
    updateAutoRetweet: builder.mutation<
      TResponse<unknown>,
      {
        accountId: string;
        body: {
          links: Array<{
            userName: string;
            accountId: string;
          }>;
        };
      }
    >({
      query: ({ accountId, body }) => ({
        url: `/api/UserSettings/PowerUps/${accountId}/AutoRetweet`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Powerups"],
    }),
    updateSelfRetweet: builder.mutation<
      TResponse<unknown>,
      {
        accountId: string;
        body: TSelfRetweet;
      }
    >({
      query: ({ accountId, body }) => ({
        url: `/api/UserSettings/PowerUps/${accountId}/SelfRetweet`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Powerups"],
    }),
    searchUser: builder.query<
      {
        accId: string;
        username: string;
      }[],
      {
        search: string;
        provider: EProviders;
      }
    >({
      query: (params) => ({
        url: `/api/UserSearch`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetPowerupsQuery,
  useUpdateAutoPlugMutation,
  useUpdateSelfRetweetMutation,
  useUpdateAutoRetweetMutation,
  useSearchUserQuery,
} = powerupsApi;
