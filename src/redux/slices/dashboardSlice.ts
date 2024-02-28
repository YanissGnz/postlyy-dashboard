import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { type DashboardConfig } from "@/types/DashboardConfig";
import { type EStatType } from "@/types/EStatType";
import { type EAggregation } from "@/types/EAggregation";

export type Props = {
  layout: DashboardConfig[];
};

const initialState = {
  layout: [],
} as Props;

export type TNewCard = {
  title: string;
  description: string;
  type: "stat" | "graph";
  query: EStatType;
  agregation: EAggregation;
};

export const dashboard = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<DashboardConfig[]>) => {
      state.layout = action.payload;
    },
    addCard: (state, action: PayloadAction<Partial<TNewCard>>) => {
      state.layout = [
        ...state.layout,
        {
          i: String(state.layout.length + 1),
          h: action.payload.type === "stat" ? 4 : 8,
          w: action.payload.type === "stat" ? 4 : 6,
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
