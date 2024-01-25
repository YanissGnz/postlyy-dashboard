import { type RootState } from "@/redux/store";
import { type TDraft } from "@/types/TDraft";
import { type TPaginatedRequest } from "@/types/TPaginatedRequest";
import { type TPaginatedResponse } from "@/types/TPaginatedResponse";
import { type TPostForm } from "@/types/TPostForm";
import { type TResponse } from "@/types/TResponse";
import { env } from "@/env";
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
  tagTypes: ["Posts", "Drafts", "Template"],
  endpoints: (builder) => ({
    addPostNow: builder.mutation<TResponse<boolean>, FormData>({
      query: (body) => ({
        url: "/api/Posting/Post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Posts", "Drafts", "Template"],
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
    getDrafts: builder.query<TPaginatedResponse<TDraft>, TPaginatedRequest>({
      query: (params) => ({
        url: "/api/Drafts",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Drafts" as const, id })),
              { type: "Drafts" as const },
            ]
          : [{ type: "Drafts" as const }],
    }),
    getDraftById: builder.query<TResponse<TPostForm>, string>({
      query: (id) => ({
        url: `/api/Drafts/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Drafts", id }],
    }),
    deleteDraft: builder.mutation<TResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/Drafts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Drafts"],
    }),
    updateDraft: builder.mutation<
      TResponse<boolean>,
      { body: FormData; id: string }
    >({
      query: ({ body, id }) => ({
        url: `/api/Drafts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Drafts", id }],
    }),
    getDraft: builder.mutation<TResponse<TPostForm>, string>({
      query: (id) => ({
        url: `/api/Drafts/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Drafts"],
    }),
    getTemplates: builder.query<TPaginatedResponse<TDraft>, TPaginatedRequest>({
      query: (params) => ({
        url: "/api/Template",
        params,
      }),
      providesTags: ["Template"],
    }),
    deleteTemplate: builder.mutation<TResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/Template/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Template"],
    }),
    updateTemplate: builder.mutation<
      TResponse<boolean>,
      { body: FormData; id: string }
    >({
      query: ({ body, id }) => ({
        url: `/api/Draft/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Template", id },
        "Template",
      ],
    }),
    getTemplate: builder.mutation<TResponse<TPostForm>, string>({
      query: (id) => ({
        url: `/api/Template/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["Template"],
    }),
    getTemplateById: builder.query<TResponse<TPostForm>, string>({
      query: (id) => ({
        url: `/api/Template/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Template", id }],
    }),
    deleteDraftImage: builder.mutation<
      TResponse<boolean>,
      {
        id: string;
        url: string;
      }
    >({
      query: ({ id, url }) => ({
        url: `/api/Drafts/Delete/Image/${id}`,
        method: "POST",
        body: {
          url,
        },
      }),
    }),
    getScheduledPostById: builder.query<TResponse<TPostForm>, string>({
      query: (id) => ({
        url: `/api/ScheduledPosts/${id}`,
      }),
    }),
    updateScheduledPost: builder.mutation<
      TResponse<boolean>,
      {
        id: string;
        body: FormData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/api/ScheduledPosts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Posts", "Drafts", "Template"],
    }),
  }),
});

export const {
  useAddPostNowMutation,
  useAddPostToQueueMutation,
  useAddPostToSpotMutation,
  useAddRecurringPostMutation,
  useGetDraftsQuery,
  useDeleteDraftMutation,
  useGetDraftMutation,
  useDeleteTemplateMutation,
  useGetTemplateMutation,
  useGetTemplatesQuery,
  useUpdateDraftMutation,
  useDeleteDraftImageMutation,
  useGetScheduledPostByIdQuery,
  useUpdateScheduledPostMutation,
  useGetTemplateByIdQuery,
  useUpdateTemplateMutation,
  useGetDraftByIdQuery,
  util: postApiUtil,
} = postApi;
