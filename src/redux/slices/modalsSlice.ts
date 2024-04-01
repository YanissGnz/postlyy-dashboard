import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type PossibleModalIds =
  | "delete-account-modal"
  | "delete-calendar-spot-modal"
  | "edit-calendar-spot-modal"
  | "add-calendar-spot-modal"
  | "delete-draft-modal"
  | "delete-note-modal"
  | "delete-template-modal"
  | "self-retweet"
  | "twitter-autoplug"
  | "twitter-auto-retweet"
  | "add-ticket-response-modal"
  | "ticket-details-modal"
  | "add-ticket-modal"
  | "calendar-post-details-modal";

export type TModal = {
  id: PossibleModalIds;
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
