import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type TSetup = {
  managers: {
    email: string;
    teamMembers: string[];
  }[];
};

const initialState = {
  managers: [
    {
      email: "current account",
      teamMembers: [],
    },
  ],
} as TSetup;

export const setup = createSlice({
  name: "setup",
  initialState,
  reducers: {
    addManager: (state, action: PayloadAction<string>) => {
      state.managers.push({
        email: action.payload,
        teamMembers: [],
      });
    },
    deleteManager: (state, action: PayloadAction<string>) => {
      state.managers = state.managers.filter(
        (manager) => manager.email !== action.payload,
      );
    },
    addTeamMember: (
      state,
      action: PayloadAction<{ email: string; manager: string }>,
    ) => {
      const manager = state.managers.find(
        (manager) => manager.email === action.payload.manager,
      );
      if (manager) {
        manager.teamMembers.push(action.payload.email);
      }
    },
    deleteTeamMember: (
      state,
      action: PayloadAction<{ email: string; manager: string }>,
    ) => {
      const manager = state.managers.find(
        (manager) => manager.email === action.payload.manager,
      );
      if (manager) {
        manager.teamMembers = manager.teamMembers.filter(
          (teamMember) => teamMember !== action.payload.email,
        );
      }
    },
  },
});

export const { addManager, addTeamMember, deleteManager, deleteTeamMember } =
  setup.actions;
export default setup.reducer;
