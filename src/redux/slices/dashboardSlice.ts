import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type DashboardConfig } from "@/types/TDashboardConfig";

import {
  getDachboardCardMinHeight,
  getDachboardCardMinWidth,
} from "@/lib/utils";
import { type TDashboardCard } from "@/types/TDashboardCard";

export type Props = {
  layout: DashboardConfig[];
};

const initialState = {
  layout: [],
} as Props;

export const dashboard = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<DashboardConfig[]>) => {
      state.layout = action.payload;
    },
    addCard: (state, action: PayloadAction<TDashboardCard>) => {
      state.layout = [
        ...state.layout,
        {
          i: String(state.layout.length + 1),
          h: getDachboardCardMinHeight(action.payload.type),
          w: getDachboardCardMinWidth(action.payload.type),
          x: 0,
          y: 0,
          ...action.payload,
        } as DashboardConfig,
      ];
    },
    removeCard: (state, action: PayloadAction<string>) => {
      state.layout = state.layout.filter((card) => card.i !== action.payload);
    },
    changeLayout: (state, action: PayloadAction<DashboardConfig[]>) => {
      state.layout = action.payload;
    },
  },
});

export const { setLayout, addCard, removeCard, changeLayout } =
  dashboard.actions;
export default dashboard.reducer;
