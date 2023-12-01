import { type TAccount } from "@/types/TAccount";
import { type TExternalLogin } from "@/types/TExternalLogin";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TAuth = {
  user: TExternalLogin | null;
  currentAccount: TAccount | null;
};

const initialState = {
  user: null,
  currentAccount: null,
} as TAuth;

export const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<TExternalLogin>) => {
      state.user = action.payload;
      state.currentAccount = action.payload?.accounts[0] ?? null;
    },
    setAccount: (state, action: PayloadAction<TAccount>) => {
      state.currentAccount = action.payload;
    },
  },
});

export const { setAccount, setUser } = auth.actions;
export default auth.reducer;
