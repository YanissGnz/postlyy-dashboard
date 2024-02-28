import { type Layout } from "react-grid-layout";
import { type EStatType } from "./EStatType";
import { type EAggregation } from "./EAggregation";

export type DashboardConfig = Layout & {
  type: "stat" | "graph";
  title: string;
  description?: string;
  query: EStatType;
  aggregation: EAggregation;
};
