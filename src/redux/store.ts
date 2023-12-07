import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { configureStore } from "@reduxjs/toolkit";
import { layout } from "./slices/layoutSlice";
import { auth } from "./slices/authSlice";
import { setup } from "./slices/setupSlice";
import { profileApi } from "./api/user/profile/apiSlice";
import { notificationsSettingsApi } from "./api/user/notifications-settings/apiSlice";
import { subscriptionApi } from "./api/user/subscription/apiSlice";

export const store = configureStore({
  reducer: {
    layout: layout.reducer,
    auth: auth.reducer,
    setup: setup.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [notificationsSettingsApi.reducerPath]: notificationsSettingsApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({})
      .concat(profileApi.middleware)
      .concat(notificationsSettingsApi.middleware)
      .concat(subscriptionApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
