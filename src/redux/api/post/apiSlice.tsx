import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postApi = createApi({
  reducerPath: "postApi",
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
  tagTypes: ["Posts", "Drafts"],
  endpoints: (builder) => ({
    addPostNow: builder.mutation<TResponse<boolean>, FormData>({
      query: (body) => ({
        url: "/api/Posting/Post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Posts"],
    }),
    addPostToQueue: builder.mutation<TResponse<boolean>, FormData>({
      query: (body) => ({
        url: "/api/Posting/Post/NextEmptySpot",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Posts"],
    }),
    addPostToSpot: builder.mutation<
      TResponse<boolean>,
      {
        spotId: string;
        body: FormData;
      }
    >({
      query: ({ body, spotId }) => ({
        url: `/api/Posting/Post/NewInSpot/${spotId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Posts"],
    }),
    addRecurringPost: builder.mutation<
      TResponse<boolean>,
      {
        recurringId: string;
        body: FormData;
      }
    >({
      query: ({ body, recurringId }) => ({
        url: `/api/Posting/Post/NewInRecurring/${recurringId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Posts"],
    }),
  }),
});

export const {
  useAddPostNowMutation,
  useAddPostToQueueMutation,
  useAddPostToSpotMutation,
  useAddRecurringPostMutation,
  util: postApiUtil,
} = postApi;
