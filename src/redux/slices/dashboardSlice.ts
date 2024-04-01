import { type DashboardConfig } from "@/types/TDashboardConfig";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  getDashboardCardMinHeight,
  getDashboardCardMinWidth,
} from "@/lib/utils";
import { type TDashboardCard } from "@/types/TDashboardCard";
import { subDays } from "date-fns";

export type Props = {
  layout: DashboardConfig[];
  startDate: string;
  endDate: string;
  userIds: string[];
};

const initialState = {
  layout: [],
  startDate: subDays(new Date(), 30).toISOString(),
  endDate: new Date().toISOString(),
  userIds:
    typeof window !== "undefined"
      ? localStorage?.getItem("userIds")
        ? (JSON.parse(localStorage.getItem("userIds")!) as string[])
        : []
      : [],
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
          h: getDashboardCardMinHeight(action.payload.type),
          w: getDashboardCardMinWidth(action.payload.type),
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
    changeDashboardDateRange: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>,
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    changeDashboardUserIds: (state, action: PayloadAction<string[]>) => {
      typeof window !== "undefined" &&
        localStorage.setItem("userIds", JSON.stringify(action.payload));
      state.userIds = action.payload;
    },
  },
});

export const {
  setLayout,
  addCard,
  removeCard,
  changeLayout,
  changeDashboardDateRange,
  changeDashboardUserIds,
} = dashboard.actions;
export default dashboard.reducer;
