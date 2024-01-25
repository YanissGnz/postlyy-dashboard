import { type RootState } from "@/redux/store";
import { env } from "@/types/env";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type TResponse } from "@/types/TResponse";
import { type TNote } from "@/types/TNote";
import { type TPaginatedResponse } from "@/types/TPaginatedResponse";
import { type TPaginatedRequest } from "@/types/TPaginatedRequest";

export const notesApi = createApi({
  reducerPath: "notesApi",
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
  tagTypes: ["Notes"],
  endpoints: (builder) => ({
    addNote: builder.mutation<TResponse<boolean>, FormData>({
      query: (body) => ({
        url: "/api/InternalNotes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notes"],
    }),
    getNotes: builder.query<TPaginatedResponse<TNote>, TPaginatedRequest>({
      query: (params) => ({
        url: "/api/InternalNotes",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Notes" as const, id })),
              "Notes",
            ]
          : ["Notes"],
    }),
    getNote: builder.query<TResponse<TNote>, string>({
      query: (id) => `/api/InternalNotes/${id}`,
      providesTags: (result, error, id) => [{ type: "Notes", id }],
    }),
    editNote: builder.mutation<
      TResponse<boolean>,
      {
        id: string;
        note: FormData;
      }
    >({
      query: ({ id, note }) => ({
        url: `/api/InternalNotes/${id}`,
        method: "PUT",
        body: note,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Notes" as const, id },
      ],
    }),
    deleteNote: builder.mutation<TResponse<boolean>, string>({
      query: (id) => ({
        url: `/api/InternalNotes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Notes" as const, id }],
    }),
  }),
});

export const {
  useAddNoteMutation,
  useGetNotesQuery,
  useGetNoteQuery,
  useEditNoteMutation,
  useDeleteNoteMutation,

  util: postApiUtil,
} = notesApi;
