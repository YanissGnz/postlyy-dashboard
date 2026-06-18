/**
 * Mock notifications data for the dummy backend
 */

export interface TMockNotification {
  id: string;
  type: "post_published" | "post_scheduled" | "engagement" | "subscription" | "system" | "team" | "other";
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  relatedPostId: string | null;
  createdAt: string;
}

export const notifications: TMockNotification[] = [
  {
    id: "notif-1",
    type: "post_published",
    title: "Post Published Successfully",
    message: "Your post 'Just launched our new product!' was published on Twitter.",
    isRead: true,
    userId: "demo-user-1",
    relatedPostId: "post-1",
    createdAt: "2026-06-15T14:00:00Z"
  },
  {
    id: "notif-2",
    type: "post_scheduled",
    title: "Post Scheduled",
    message: "Your post has been scheduled for June 20, 2026 at 4:00 PM.",
    isRead: false,
    userId: "demo-user-1",
    relatedPostId: "post-3",
    createdAt: "2026-06-17T12:00:00Z"
  },
  {
    id: "notif-3",
    type: "engagement",
    title: "New Engagement",
    message: "Your post received 128 likes and 34 replies on LinkedIn.",
    isRead: false,
    userId: "demo-user-2",
    relatedPostId: "post-2",
    createdAt: "2026-06-16T15:00:00Z"
  },
  {
    id: "notif-4",
    type: "subscription",
    title: "Subscription Reminder",
    message: "Your trial period ends in 7 days. Upgrade to continue using all features.",
    isRead: false,
    userId: "demo-user-3",
    relatedPostId: null,
    createdAt: "2026-06-18T00:00:00Z"
  },
  {
    id: "notif-5",
    type: "system",
    title: "System Update",
    message: "New features have been added to Postlyy. Check out what's new!",
    isRead: false,
    userId: "demo-user-1",
    relatedPostId: null,
    createdAt: "2026-06-17T08:00:00Z"
  }
];

export function getNotificationsByUser(userId: string, unreadOnly?: boolean): TMockNotification[] {
  let result = notifications.filter(n => n.userId === userId);
  if (unreadOnly) {
    result = result.filter(n => !n.isRead);
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markAsRead(id: string): boolean {
  const notif = notifications.find(n => n.id === id);
  if (!notif) return false;
  notif.isRead = true;
  return true;
}

export function markAllAsRead(userId: string): number {
  let count = 0;
  notifications.forEach(n => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      count++;
    }
  });
  return count;
}