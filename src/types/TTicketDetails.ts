type TTickerResponse = {
  id: string;
  response: string;
  writtenAt: string;
  writtenBy: string;
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
