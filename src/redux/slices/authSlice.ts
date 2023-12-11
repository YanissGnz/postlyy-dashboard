import { type TAccount } from "@/types/TAccount";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TAuth = {
  token: string | null;
  currentAccount: TAccount | null;
};

const initialState = {
  token: null,
  currentAccount: null,
} as TAuth;

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setAccount: (state, action: PayloadAction<TAccount>) => {
      state.currentAccount = action.payload;
    },
  },
});

export const { setAccount, setToken } = auth.actions;
export default auth.reducer;
