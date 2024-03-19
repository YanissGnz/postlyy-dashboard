export type TPowerups = {
  autoPlug: {
    activate: boolean;
    autoPlugMessages: Array<{
      id: string;
      message: string;
      media: string;
      mediaFile: File | null;
    }>;
    condition: number;
    conditionValue: number;
  };
  selfRetweet: {
    activate: boolean;
    delayHours: number;
    condition: number;
    conditionValue: number;
  };
  autoRetweetLinks: Array<{
    userName: string;
    accountId: string;
  }>;
  emptySpotsActAsEvergreen: boolean;
  splitLongTextToThreads: boolean;
  expandThreadsAfterThreeLines: boolean;
};
