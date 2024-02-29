export type TDashboardGraph = {
  category: Array<string>;
  series: Array<{
    name: string;
    data: Array<number>;
  }>;
};
