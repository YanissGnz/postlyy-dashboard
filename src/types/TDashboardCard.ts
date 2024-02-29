import { type EAggregation } from "./EAggregation";
import { type EDashboardCardType } from "./EDashboardCardType";
import { type EStatType } from "./EStatType";

export type TDashboardCard = {
  title: string;
  description?: string;
  type: EDashboardCardType;
  query: EStatType;
  aggregation: EAggregation;
};
