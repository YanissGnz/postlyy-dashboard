import { env } from "@/env";
import { convertToLocalDate, convertToUTC } from "@/lib/utils";
import { type RootState } from "@/redux/store";
import { type EProviders } from "@/types/EProviders";
import { type TCalendarEvent } from "@/types/TCalendarEvent";
import {
  type TCalendarSlot,
  type TResponseCalendarSlot,
} from "@/types/TCalendarSlot";
import { type TRecurringPost } from "@/types/TRecurringPost";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
  tagTypes: ["Events", "Recurring", "Slot"],
  endpoints: (builder) => ({
    getEvents: builder.query<
      TResponse<TCalendarEvent[]>,
      { startDate?: string }
    >({
      query: (params) => ({
        url: "/api/Calendar",
        params,
      }),
      transformResponse: (response: TResponse<TCalendarEvent[]>) => {
        return {
          ...response,
          data: response.data.map((event) => ({
            ...event,
            start: convertToLocalDate(event.start).toISOString(),
            startTime: convertToLocalDate(event.startTime).toISOString(),
          })),
        };
      },
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
    addSlot: builder.mutation<TResponse<TCalendarSlot>, TCalendarSlot>({
      query: (body) => ({
        url: "/api/Calendar/slot",
        method: "POST",
        body: {
          ...body,
          start: convertToUTC(body.start),
        },
      }),
      invalidatesTags: ["Events", "Slot"],
    }),
    updateSlot: builder.mutation<
      TResponse<TCalendarSlot>,
      TCalendarSlot & { id: string }
    >({
      query: (body) => ({
        url: `/api/Calendar/slot/${body.id}`,
        method: "PUT",
        body: {
          ...body,
          start: convertToUTC(body.start),
        },
      }),
      invalidatesTags: ["Events", "Slot"],
    }),
    deleteSlot: builder.mutation<TResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/Calendar/slot/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events", "Slot"],
    }),
    getNextFiveSlots: builder.query<
      TResponse<TResponseCalendarSlot[]>,
      { providers: Array<EProviders> }
    >({
      query: ({ providers }) => ({
        url: "/api/Calendar/next5",
        params: {
          ...Object.fromEntries(
            providers.map((provider, i) => [`providers[${i}]`, provider]),
          ),
        },
      }),
      providesTags: ["Slot"],
    }),
    getRecurringSlots: builder.query<TResponse<TResponseCalendarSlot[]>, void>({
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
  useAddSlotMutation,
  useDeleteSlotMutation,
  useUpdateSlotMutation,
  useGetNextFiveSlotsQuery,
  useGetRecurringSlotsQuery,
  util: calendarApiUtil,
} = calendarApi;
