import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { type TAccount } from "@/types/TAccount";
import { type TNewAccount } from "@/types/TNewAccount";
import { type TResponse } from "@/types/TResponse";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const accountApi = createApi({
  reducerPath: "accountApi",
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
  tagTypes: ["Accounts"],
  endpoints: (builder) => ({
    getAccounts: builder.query<TResponse<TAccount[]>, void>({
      query: () => "/api/Account",
      providesTags: ["Accounts"],
    }),
    addAccount: builder.mutation<void, TNewAccount>({
      query: (body) => ({
        url: "/api/Account",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounts"],
    }),
    deleteAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/Account/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounts"],
    }),
  }),
});

export const {
  useAddAccountMutation,
  useDeleteAccountMutation,
  useGetAccountsQuery,
} = accountApi;
