/**
 * Mock templates data for the dummy backend
 */

export interface TMockTemplate {
  id: string;
  name: string;
  content: string;
  platform: string;
  mediaUrls: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const templates: TMockTemplate[] = [
  {
    id: "template-1",
    name: "Product Launch Announcement",
    content: "🎉 Big news! We're launching {product_name} on {date}!\n\nGet ready for:\n- Feature 1\n- Feature 2\n- Feature 3\n\nMark your calendars! #{hashtag}",
    platform: "twitter",
    mediaUrls: [],
    userId: "demo-user-1",
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z"
  },
  {
    id: "template-2",
    name: "Weekly Motivation",
    content: "Happy Monday! 💪 Here's your dose of motivation for the week:\n\n\"{quote}\"\n\nWhat's your goal this week? Share below! 👇",
    platform: "linkedin",
    mediaUrls: ["https://api.postlyy.com/images/motivation-bg.jpg"],
    userId: "demo-user-2",
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-05-15T10:00:00Z"
  },
  {
    id: "template-3",
    name: "Behind the Scenes",
    content: "Take a peek behind the curtain! 🎬 Here's what {team_name} has been working on this week...\n\n{update}",
    platform: "twitter",
    mediaUrls: [],
    userId: "demo-user-1",
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-04-20T10:00:00Z"
  },
  {
    id: "template-4",
    name: "Customer Testimonial",
    content: "Don't just take our word for it! Here's what {customer_name} had to say:\n\n\"{testimonial}\"\n\nThank you for trusting us! 🙏",
    platform: "linkedin",
    mediaUrls: [],
    userId: "demo-user-2",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z"
  }
];

export function getTemplatesByUser(userId: string): TMockTemplate[] {
  return templates.filter(t => t.userId === userId);
}

export function getTemplateById(id: string): TMockTemplate | undefined {
  return templates.find(t => t.id === id);
}

export function createTemplate(template: Omit<TMockTemplate, "id" | "createdAt" | "updatedAt">): TMockTemplate {
  const now = new Date().toISOString();
  const newTemplate: TMockTemplate = {
    ...template,
    id: `template-${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  templates.push(newTemplate);
  return newTemplate;
}

export function updateTemplate(id: string, updates: Partial<TMockTemplate>): TMockTemplate | null {
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() } as TMockTemplate;
  return templates[index] ?? null;
}

export function deleteTemplate(id: string): boolean {
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return false;
  templates.splice(index, 1);
  return true;
}