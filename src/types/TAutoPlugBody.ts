export type TAutoPlugBody = {
  activate: boolean;
  autoPlugMessages: Array<{
    id: string;
    message: string;
    media: string;
    mediaFile: string;
  }>;
  condition: number;
  conditionValue: number;
};
