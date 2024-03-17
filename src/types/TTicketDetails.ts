type TTickerResponse = {
  id: string;
  response: string;
};

export type TTicketDetails = {
  context: string;
  responses: Array<TTickerResponse>;
  id: string;
  title: string;
  type: number;
  status: number;
  priority: number;
  createdAt: string;
  lastUpdateAt: string;
};
