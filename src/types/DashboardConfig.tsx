import { type Layout } from "react-grid-layout";

export type DashboardConfig = Layout & {
  type: "stat" | "graph";
  title: string;
  description?: string;
  query: "followers" | "posts" | "user_growth" | "post_growth";
};
