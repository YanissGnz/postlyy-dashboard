import { type EAggregation } from "./EAggregation";
import { type EProviders } from "./EProviders";
import { type EStatType } from "./EStatType";

export type TDashboardStatParams = {
  aggregation?: EAggregation;
  provider: EProviders;
  statType: EStatType;
  startDate?: string;
  endDate?: string;
  userIds?: string[];
};
