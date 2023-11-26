import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { configureStore } from "@reduxjs/toolkit";
import { layout } from "./slices/layoutSlice";

export const store = configureStore({
  reducer: {
    layout: layout.reducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({}),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
