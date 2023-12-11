import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TNotificationsSettings } from "@/types/TNotificationsSettings";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationsSettingsApi = createApi({
  reducerPath: "notificationsSettingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: env.NEXT_PUBLIC_API_BASEURL,
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
  tagTypes: ["NotificationsSettings"],
  endpoints: (builder) => ({
    getNotificationsSettings: builder.query<
      TResponse<TNotificationsSettings>,
      void
    >({
      query: () => "/api/UserSettings/Notifications",
      providesTags: ["NotificationsSettings"],
    }),
    updateNotificationsSettings: builder.mutation<
      TResponse<TNotificationsSettings>,
      TNotificationsSettings
    >({
      query: (body) => ({
        url: "/api/UserSettings/Notifications",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["NotificationsSettings"],
    }),
  }),
});

export const {
  useGetNotificationsSettingsQuery,
  useUpdateNotificationsSettingsMutation,
} = notificationsSettingsApi;
