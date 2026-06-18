/**
 * Mock drafts data for the dummy backend
 */

export interface TMockDraft {
  id: string;
  content: string;
  mediaUrls: string[];
  platform: string;
  accountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const drafts: TMockDraft[] = [
  {
    id: "draft-1",
    content: "Excited to announce our upcoming webinar on AI and social media marketing! Register now link in bio. 🤖 #AI #Marketing",
    mediaUrls: ["https://api.postlyy.com/images/webinar-flyer.jpg"],
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    createdAt: "2026-06-17T10:00:00Z",
    updatedAt: "2026-06-17T14:00:00Z"
  },
  {
    id: "draft-2",
    content: "5 ways Postlyy helps you save time:\n\n1. Schedule posts in advance\n2. Bulk upload your content calendar\n3. Recurring post templates\n4. Team collaboration\n5. Analytics to optimize timing\n\nWhat's your biggest scheduling challenge?",
    mediaUrls: [],
    platform: "linkedin",
    accountId: "acc-3",
    userId: "demo-user-2",
    createdAt: "2026-06-16T08:00:00Z",
    updatedAt: "2026-06-17T09:00:00Z"
  },
  {
    id: "draft-3",
    content: "Behind the scenes at our office today! The team is working hard on some exciting new features. Stay tuned for announcements! 🎨",
    mediaUrls: ["https://api.postlyy.com/images/office1.jpg", "https://api.postlyy.com/images/office2.jpg"],
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    createdAt: "2026-06-15T16:00:00Z",
    updatedAt: "2026-06-16T10:00:00Z"
  }
];

export function getDraftsByUser(userId: string): TMockDraft[] {
  return drafts.filter(d => d.userId === userId);
}

export function getDraftById(id: string): TMockDraft | undefined {
  return drafts.find(d => d.id === id);
}

export function createDraft(draft: Omit<TMockDraft, "id" | "createdAt" | "updatedAt">): TMockDraft {
  const now = new Date().toISOString();
  const newDraft: TMockDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  drafts.push(newDraft);
  return newDraft;
}

export function updateDraft(id: string, updates: Partial<TMockDraft>): TMockDraft | null {
  const index = drafts.findIndex(d => d.id === id);
  if (index === -1) return null;
  drafts[index] = { ...drafts[index], ...updates, updatedAt: new Date().toISOString() } as TMockDraft;
  return drafts[index] ?? null;
}

export function deleteDraft(id: string): boolean {
  const index = drafts.findIndex(d => d.id === id);
  if (index === -1) return false;
  drafts.splice(index, 1);
  return true;
}