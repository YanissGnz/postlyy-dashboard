import { type TAccount } from "@/types/TAccount";
import { type TDBUser } from "@/types/TDBUser";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TAuth = {
  user: TDBUser | null;
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
    setUser: (state, action: PayloadAction<TDBUser>) => {
      state.user = action.payload;
      state.currentAccount = action.payload.accounts[0] ?? null;
    },
    setAccount: (state, action: PayloadAction<TAccount>) => {
      state.currentAccount = action.payload;
    },
  },
});

export const { setAccount, setUser } = auth.actions;
export default auth.reducer;
