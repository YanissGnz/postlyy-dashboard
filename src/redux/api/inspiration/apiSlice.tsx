import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TInspirationRequest } from "@/types/TInspirationRequest";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const inspirationApi = createApi({
  reducerPath: "inspirationApi",
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
  endpoints: (builder) => ({
    genrateInspiration: builder.mutation<
      TResponse<{ content: string[] }>,
      TInspirationRequest
    >({
      query: (body) => ({
        url: "/api/AInspiration",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGenrateInspirationMutation } = inspirationApi;
