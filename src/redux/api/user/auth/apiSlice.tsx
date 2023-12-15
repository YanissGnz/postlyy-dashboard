import { env } from "@/env";
import { type RootState } from "@/redux/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
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
  tagTypes: [],
  endpoints: (builder) => ({
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/api/Authentication/ForgotPassword",
        method: "POST",
        body,
      }),
    }),
    resetForgottenPassword: builder.mutation<
      void,
      {
        email: string;
        code: string;
        newPassword: string;
      }
    >({
      query: (body) => ({
        url: "/api/Authentication/ChangeForgottenPassword",
        method: "PUT",
        body,
      }),
    }),
    changePassword: builder.mutation<
      void,
      {
        currentPassword: string;
        newPassword: string;
      }
    >({
      query: (body) => ({
        url: "/api/Authentication/ChangePassword",
        method: "PUT",
        body,
      }),
    }),
    setupEmail: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/api/Authentication/SetupEmail",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useForgotPasswordMutation,
  useResetForgottenPasswordMutation,
  useChangePasswordMutation,
  useSetupEmailMutation,
} = authApi;
