export type TSubscriptionSettings = {
  id: string;
  tier: number;
  payingDate: string;
  renewalDate: string;
  notificationDate: string;
  seats: number;
  subscriptionPrice: number;
  isNotified: boolean;
  isPendingSuspension: boolean;
  isPendingDeletion: boolean;
  deletionDate: string;
  isTrial: boolean;
  history: Array<{
    dateOfPayment: string;
    seatsPaid: number;
    subscribed: Array<string>;
  }>;
};
