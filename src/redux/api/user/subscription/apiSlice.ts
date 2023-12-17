import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TSubscriptionSettings } from "@/types/TSubscriptionSettings";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
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
  tagTypes: ["SubscriptionSettings"],
  endpoints: (builder) => ({
    getSubscriptionSettings: builder.query<
      TResponse<TSubscriptionSettings>,
      void
    >({
      query: () => "/api/Subscription/get",
      providesTags: ["SubscriptionSettings"],
    }),
    cancelSubscription: builder.mutation<
      TResponse<TSubscriptionSettings>,
      void
    >({
      query: () => ({
        url: "/api/Subscription/cancel",
        method: "POST",
      }),
    }),
    getPaymentLink: builder.mutation<
      TResponse<{
        link: string;
      }>,
      void
    >({
      query: () => ({
        url: "/api/Subscription/link",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSubscriptionSettingsQuery,
  useCancelSubscriptionMutation,
  useGetPaymentLinkMutation,
} = subscriptionApi;
