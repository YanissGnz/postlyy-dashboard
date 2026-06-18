/**
 * Dummy Backend - Mock data and utilities for Postlyy
 * 
 * This module provides mock data for development when the real backend is unavailable.
 * Toggle with DUMMY_BACKEND=true in .env.local
 */

import { drafts } from "./drafts";
import { notifications } from "./notifications";
import { posts } from "./posts";
import { templates } from "./templates";
import { users } from "./users";

// Mock recurring schedules
export const recurringSchedules = [
  {
    id: "recurring-1",
    name: "Monday Motivation",
    content: "Monday motivation: The secret of getting ahead is getting started. - Mark Twain 💪",
    platform: "twitter",
    accountId: "acc-1",
    userId: "demo-user-1",
    frequency: "weekly",
    dayOfWeek: "monday",
    time: "08:00",
    isActive: true,
    createdAt: "2026-06-01T10:00:00Z"
  },
  {
    id: "recurring-2",
    name: "Weekly LinkedIn Tips",
    content: "This week's tip: Engage with your audience within the first hour of posting for maximum reach!",
    platform: "linkedin",
    accountId: "acc-3",
    userId: "demo-user-2",
    frequency: "weekly",
    dayOfWeek: "wednesday",
    time: "10:00",
    isActive: true,
    createdAt: "2026-06-01T10:00:00Z"
  }
];

// Mock spots for scheduling
export const spots = [
  { id: "spot-1", date: "2026-06-19T14:00:00Z", postId: "post-1", platform: "twitter" },
  { id: "spot-2", date: "2026-06-20T09:00:00Z", postId: null, platform: "linkedin" },
  { id: "spot-3", date: "2026-06-20T16:00:00Z", postId: "post-3", platform: "twitter" },
  { id: "spot-4", date: "2026-06-21T10:00:00Z", postId: null, platform: "twitter" },
  { id: "spot-5", date: "2026-06-22T08:00:00Z", postId: "post-4", platform: "twitter" },
];

// Mock calendar events
export const calendarEvents = [
  {
    id: "cal-1",
    postId: "post-1",
    title: "Product Launch Post",
    startTime: "2026-06-15T14:00:00Z",
    endTime: "2026-06-15T14:05:00Z",
    platform: "twitter",
    status: "published"
  },
  {
    id: "cal-2",
    postId: "post-3",
    title: "Teaser Post",
    startTime: "2026-06-20T16:00:00Z",
    endTime: "2026-06-20T16:05:00Z",
    platform: "twitter",
    status: "scheduled"
  },
  {
    id: "cal-3",
    postId: "post-4",
    title: "Monday Motivation",
    startTime: "2026-06-22T08:00:00Z",
    endTime: "2026-06-22T08:05:00Z",
    platform: "twitter",
    status: "scheduled"
  }
];

// Mock dashboard analytics
export const dashboardAnalytics = {
  totalPosts: 156,
  scheduledPosts: 12,
  draftedPosts: 3,
  publishedThisMonth: 28,
  totalEngagement: {
    likes: 1243,
    retweets: 342,
    replies: 189,
    comments: 95
  },
  topPosts: [
    { id: "post-6", content: "Thank you for 10K followers! 🎉", engagement: 368, platform: "twitter" },
    { id: "post-2", content: "5 tips for growing your social media presence", engagement: 196, platform: "linkedin" },
    { id: "post-1", content: "Just launched our new product! 🚀", engagement: 65, platform: "twitter" }
  ],
  engagementByPlatform: {
    twitter: { likes: 856, retweets: 245, replies: 123 },
    linkedin: { likes: 387, retweets: 0, replies: 66 }
  },
  postingSchedule: {
    monday: 25,
    tuesday: 30,
    wednesday: 28,
    thursday: 22,
    friday: 18,
    saturday: 15,
    sunday: 12
  }
};

// Mock inspiration content
export const inspirationContent = [
  {
    id: "insp-1",
    title: "Summer Campaign Ideas",
    category: "seasonal",
    content: "Create a series of posts highlighting your summer products...",
    imageUrl: "https://api.postlyy.com/images/inspiration/summer.jpg",
    platform: "twitter"
  },
  {
    id: "insp-2",
    title: "Employee Spotlight Template",
    category: "company-culture",
    content: "Meet our team member of the month! Share their story and contributions...",
    imageUrl: "https://api.postlyy.com/images/inspiration/spotlight.jpg",
    platform: "linkedin"
  },
  {
    id: "insp-3",
    title: "Customer Success Story",
    category: "testimonial",
    content: "How our client achieved 200% growth using our platform...",
    imageUrl: "https://api.postlyy.com/images/inspiration/success.jpg",
    platform: "linkedin"
  }
];

// Mock notes
export const notes = [
  {
    id: "note-1",
    title: "Q3 Marketing Strategy",
    content: "Key initiatives:\n1. Launch new product line\n2. Increase social media presence\n3. Partner with influencers",
    userId: "demo-user-1",
    createdAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-06-15T14:00:00Z"
  },
  {
    id: "note-2",
    title: "Content Calendar Ideas",
    content: "Blog post topics:\n- How to grow on Twitter\n- LinkedIn best practices\n- Social media analytics tips",
    userId: "demo-user-2",
    createdAt: "2026-06-12T09:00:00Z",
    updatedAt: "2026-06-16T11:00:00Z"
  }
];

// Mock subscription plans
export const subscriptionPlans = {
  basic: {
    name: "Basic",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: ["5 social accounts", "100 scheduled posts", "Basic analytics", "Email support"]
  },
  pro: {
    name: "Pro",
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: ["15 social accounts", "Unlimited posts", "Advanced analytics", "Team collaboration", "Priority support"]
  },
  expert: {
    name: "Expert",
    monthlyPrice: 59.99,
    yearlyPrice: 599.99,
    features: ["Unlimited accounts", "Unlimited posts", "White-label reports", "API access", "Dedicated support", "Custom integrations"]
  }
};

// Mock team members
export const teamMembers = [
  {
    id: "team-member-1",
    userId: "demo-user-2",
    name: "Admin User",
    email: "admin@postlyy.com",
    role: "admin",
    avatar: "https://api.postlyy.com/Images/Default.jpeg",
    joinedAt: "2025-01-15T10:00:00Z"
  },
  {
    id: "team-member-2",
    userId: "demo-user-1",
    name: "Demo User",
    email: "demo@postlyy.com",
    role: "member",
    avatar: "https://api.postlyy.com/Images/Default.jpeg",
    joinedAt: "2025-06-01T10:00:00Z"
  },
  {
    id: "team-member-3",
    userId: "demo-user-3",
    name: "Basic User",
    email: "basic@postlyy.com",
    role: "member",
    avatar: "https://api.postlyy.com/Images/Default.jpeg",
    joinedAt: "2026-06-01T10:00:00Z"
  }
];

// Mock notification settings
export const notificationSettings = {
  postUpdates: true,
  engagementAlerts: true,
  subscriptionReminders: true,
  productUpdates: false,
  marketingEmails: false,
  emailNotifications: true
};

export { drafts, notifications, posts, templates, users };
