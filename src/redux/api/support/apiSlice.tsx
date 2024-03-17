import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TPaginatedRequest } from "@/types/TPaginatedRequest";
import { type TPaginatedResponse } from "@/types/TPaginatedResponse";
import { type TResponse } from "@/types/TResponse";
import { type TTicket } from "@/types/TTicket";
import { type TTicketDetails } from "@/types/TTicketDetails";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const supportApi = createApi({
  reducerPath: "supportApi",
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
  tagTypes: ["Tickets"],
  endpoints: (builder) => ({
    getAllTickets: builder.query<
      TPaginatedResponse<TTicket>,
      TPaginatedRequest
    >({
      query: (params) => ({
        url: "/api/Support",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Tickets" as const,
                id,
              })),
              "Tickets",
            ]
          : ["Tickets"],
    }),
    getTicket: builder.query<TResponse<TTicketDetails>, string>({
      query: (id) => `/api/Support/${id}`,
      providesTags: (result, error, id) => [{ type: "Tickets", id }],
    }),
    addTicket: builder.mutation<TResponse<TTicket>, Partial<TTicket>>({
      query: (body) => ({
        url: "/api/Support",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tickets"],
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useGetTicketQuery,
  useAddTicketMutation,
} = supportApi;
