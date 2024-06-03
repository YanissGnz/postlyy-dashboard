import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TNotification } from "@/types/TNotification";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
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
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      TResponse<TNotification[]>,
      { page?: number }
    >({
      query: (params) => ({
        url: "/api/Notifications/all",
        method: "GET",
        params,
      }),
      providesTags: ["Notifications"],
    }),
    dismissNotification: builder.mutation<TResponse<TNotification>, string>({
      query: (notificationId) => ({
        url: `/api/Notifications/dismiss`,
        method: "POST",
        params: { notificationId },
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { useGetNotificationsQuery, useDismissNotificationMutation } =
  notificationsApi;
