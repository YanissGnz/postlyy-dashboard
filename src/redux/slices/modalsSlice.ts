import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TModal = {
  id: string;
  data: unknown;
};

export type TModals = {
  list: TModal[];
};

const initialState = {
  list: [],
} as TModals;

export const modals = createSlice({
  name: "modals",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<TModal>) => {
      if (state.list.find((item) => item.id === action.payload.id)) {
        return;
      }
      state.list.push(action.payload);
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((item) => item.id !== action.payload);
    },
  },
});

export const { openModal, closeModal } = modals.actions;
export default modals.reducer;
