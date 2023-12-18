import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newsLetterApi = createApi({
  reducerPath: "newsLetter",
  baseQuery: fetchBaseQuery({
    baseUrl: `https://api.postlyy.com/`,
  }),
  // eslint-disable-next-line consistent-return

  tagTypes: [],
  endpoints: (builder) => ({
    subscribe: builder.mutation<string[], { email: string }>({
      query: (data) => ({
        url: "/api/Landing/Newsletter",
        method: "POST",
        body: data,
        responseHandler: "content-type",
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { useSubscribeMutation } = newsLetterApi;

// export endpoints for use in SSR
export const { subscribe } = newsLetterApi.endpoints;
