import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import { type TCalendarSpot } from "@/types/TCalendarSpot";
import { type TRecurringPost } from "@/types/TRecurringPost";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type TResponseCalendarSpot } from "@/types/TCalendarSpot";

export const calendarApi = createApi({
  reducerPath: "calendarApi",
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
  tagTypes: ["Events", "Recurring", "Spot"],
  endpoints: (builder) => ({
    getEvents: builder.query<TResponse<TCalendarEvent[]>, void>({
      query: () => "/api/Calendar",
      providesTags: ["Events"],
    }),
    addRecurringPost: builder.mutation<
      TResponse<TRecurringPost>,
      TRecurringPost
    >({
      query: (body) => ({
        url: "/api/Calendar/recurring",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events", "Recurring"],
    }),
    updateRecurringPost: builder.mutation<
      TResponse<TRecurringPost>,
      TRecurringPost & { id: string }
    >({
      query: (body) => ({
        url: `/api/Calendar/recurring/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Events", "Recurring"],
    }),
    deleteRecurringPost: builder.mutation<TResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/Calendar/recurring/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events", "Recurring"],
    }),
    addSpot: builder.mutation<TResponse<TCalendarSpot>, TCalendarSpot>({
      query: (body) => ({
        url: "/api/Calendar/spot",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events", "Spot"],
    }),
    updateSpot: builder.mutation<
      TResponse<TCalendarSpot>,
      TCalendarSpot & { id: string }
    >({
      query: (body) => ({
        url: `/api/Calendar/spot/${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Events", "Spot"],
    }),
    deleteSpot: builder.mutation<TResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/Calendar/spot/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events", "Spot"],
    }),
    getNextFiveSpots: builder.query<TResponse<TResponseCalendarSpot[]>, void>({
      query: () => "/api/Calendar/next5",
      providesTags: ["Spot"],
    }),
    getRecurringSpots: builder.query<TResponse<TResponseCalendarSpot[]>, void>({
      query: () => "/api/Calendar/recurring",
      providesTags: ["Recurring"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useAddRecurringPostMutation,
  useDeleteRecurringPostMutation,
  useUpdateRecurringPostMutation,
  useAddSpotMutation,
  useDeleteSpotMutation,
  useUpdateSpotMutation,
  useGetNextFiveSpotsQuery,
  useGetRecurringSpotsQuery,
  util: calendarApiUtil,
} = calendarApi;
