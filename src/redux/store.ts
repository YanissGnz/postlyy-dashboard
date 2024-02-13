import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { configureStore } from "@reduxjs/toolkit";
import { layout } from "./slices/layoutSlice";
import { auth } from "./slices/authSlice";
import { setup } from "./slices/setupSlice";
import { modals } from "./slices/modalsSlice";
import { profileApi } from "./api/user/profile/apiSlice";
import { notificationsSettingsApi } from "./api/user/notifications-settings/apiSlice";
import { subscriptionApi } from "./api/user/subscription/apiSlice";
import { teamApi } from "./api/user/team/apiSlice";
import { authApi } from "./api/user/auth/apiSlice";
import { accountApi } from "./api/user/account/apiSlice";
import { newsLetterApi } from "./api/newsLetterApi";
import { calendarApi } from "./api/calendar/apiSlice";
import { postApi } from "./api/post/apiSlice";
import { notesApi } from "./api/notes/apiSlice";
import { powerupsApi } from "./api/user/powerups/apiSlice";
import { dashboard } from "./slices/dashboardSlice";
import { dashboardApi } from "./api/user/dashboard/apiSlice";

export const store = configureStore({
  reducer: {
    layout: layout.reducer,
    auth: auth.reducer,
    setup: setup.reducer,
    modals: modals.reducer,
    dashboard: dashboard.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [notificationsSettingsApi.reducerPath]: notificationsSettingsApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [newsLetterApi.reducerPath]: newsLetterApi.reducer,
    [calendarApi.reducerPath]: calendarApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [notesApi.reducerPath]: notesApi.reducer,
    [powerupsApi.reducerPath]: powerupsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({})
      .concat(profileApi.middleware)
      .concat(notificationsSettingsApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(teamApi.middleware)
      .concat(authApi.middleware)
      .concat(accountApi.middleware)
      .concat(newsLetterApi.middleware)
      .concat(calendarApi.middleware)
      .concat(postApi.middleware)
      .concat(notesApi.middleware)
      .concat(powerupsApi.middleware)
      .concat(dashboardApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
