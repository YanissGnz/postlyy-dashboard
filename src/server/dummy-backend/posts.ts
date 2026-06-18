/**
 * Mock posts data for the dummy backend
 */

export interface TMockPost {
  id: string;
  content: string;
  mediaUrls: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledDate: string | null;
  publishedDate: string | null;
  platform: string;
  accountId: string;
  userId: string;
  recurringId: string | null;
  spotId: string | null;
  likes: number;
  retweets: number;
  replies: number;
  createdAt: string;
}

export const posts: TMockPost[] = [
  {
    id: "post-1",
    content: "Just launched our new product! 🚀 Excited to share this milestone with everyone. #startup #tech",
    mediaUrls: ["https://api.postlyy.com/images/post1.jpg"],
    status: "published",
    scheduledDate: "2026-06-15T14:00:00Z",
    publishedDate: "2026-06-15T14:00:00Z",
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    recurringId: null,
    spotId: "spot-1",
    likes: 42,
    retweets: 15,
    replies: 8,
    createdAt: "2026-06-14T10:00:00Z"
  },
  {
    id: "post-2",
    content: "Here are 5 tips for growing your social media presence:\n\n1. Post consistently\n2. Engage with your audience\n3. Use analytics\n4. Create quality content\n5. Be patient\n\nWhat would you add? 👇",
    mediaUrls: [],
    status: "published",
    scheduledDate: "2026-06-16T09:00:00Z",
    publishedDate: "2026-06-16T09:00:00Z",
    platform: "linkedin",
    accountId: "acc-3",
    userId: "demo-user-2",
    recurringId: null,
    spotId: "spot-2",
    likes: 128,
    retweets: 0,
    replies: 34,
    createdAt: "2026-06-15T08:00:00Z"
  },
  {
    id: "post-3",
    content: "Working on something exciting... Stay tuned! 👀 #comingsoon",
    mediaUrls: ["https://api.postlyy.com/images/teaser.png"],
    status: "scheduled",
    scheduledDate: "2026-06-20T16:00:00Z",
    publishedDate: null,
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    recurringId: null,
    spotId: "spot-3",
    likes: 0,
    retweets: 0,
    replies: 0,
    createdAt: "2026-06-17T12:00:00Z"
  },
  {
    id: "post-4",
    content: "Monday motivation: The secret of getting ahead is getting started. - Mark Twain 💪",
    mediaUrls: [],
    status: "scheduled",
    scheduledDate: "2026-06-22T08:00:00Z",
    publishedDate: null,
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    recurringId: "recurring-1",
    spotId: null,
    likes: 0,
    retweets: 0,
    replies: 0,
    createdAt: "2026-06-17T15:00:00Z"
  },
  {
    id: "post-5",
    content: "Check out our latest blog post on effective social media strategies! Link in bio. 📝",
    mediaUrls: ["https://api.postlyy.com/images/blog-thumb.jpg"],
    status: "draft",
    scheduledDate: null,
    publishedDate: null,
    platform: "linkedin",
    accountId: "acc-3",
    userId: "demo-user-2",
    recurringId: null,
    spotId: null,
    likes: 0,
    retweets: 0,
    replies: 0,
    createdAt: "2026-06-18T09:00:00Z"
  },
  {
    id: "post-6",
    content: "Thank you for 10K followers! 🎉 Your support means the world to us.",
    mediaUrls: ["https://api.postlyy.com/images/celebration.gif"],
    status: "published",
    scheduledDate: "2026-06-10T12:00:00Z",
    publishedDate: "2026-06-10T12:00:00Z",
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    recurringId: null,
    spotId: "spot-6",
    likes: 256,
    retweets: 45,
    replies: 67,
    createdAt: "2026-06-09T10:00:00Z"
  }
];

/**
 * Get posts filtered by user ID and optional status
 */
export function getPostsByUser(userId: string, status?: string): TMockPost[] {
  let result = posts.filter(p => p.userId === userId);
  if (status) {
    result = result.filter(p => p.status === status);
  }
  return result;
}

/**
 * Get a post by ID
 */
export function getPostById(id: string): TMockPost | undefined {
  return posts.find(p => p.id === id);
}

/**
 * Create a new post
 */
export function createPost(post: {
  content: string;
  mediaUrls: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledDate: string | null;
  publishedDate: string | null;
  platform: string;
  accountId: string;
  userId: string;
  recurringId: string | null;
  spotId: string | null;
  likes: number;
  retweets: number;
  replies: number;
}): TMockPost {
  const newPost: TMockPost = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  return newPost;
}

/**
 * Update a post
 */
export function updatePost(id: string, updates: Partial<TMockPost>): TMockPost | null {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;
  posts[index] = { ...posts[index], ...updates } as TMockPost;
  return posts[index] ?? null;
}

/**
 * Delete a post
 */
export function deletePost(id: string): boolean {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return false;
  posts.splice(index, 1);
  return true;
}