import { ENotificationType } from "@/types/ENotificationType";
import { EPostSpotType } from "@/types/EPostSpotType";
import { EProviders } from "@/types/EProviders";
import { ETicketPriority } from "@/types/ETicketPriority";
import { ETicketStatus } from "@/types/ETicketStatus";
import { ETicketType } from "@/types/ETicketType";
import { ETiers } from "@/types/ETiers";
import { EUserType } from "@/types/EUserType";

export type MockDB = {
  users: MockUser[];
  accounts: MockAccount[];
  drafts: MockDraft[];
  templates: MockTemplate[];
  calendarEvents: MockCalendarEvent[];
  calendarSpots: MockCalendarSpot[];
  recurringPosts: MockRecurringPost[];
  postHistory: MockPostHistoryEntry[];
  scheduledPosts: MockScheduledPost[];
  notes: MockNote[];
  tickets: MockTicket[];
  ticketDetails: MockTicketDetails[];
  notifications: MockNotification[];
  powerups: MockPowerups;
  finisher: MockFinisher;
  profile: MockProfile;
  subscription: MockSubscription;
  team: MockTeamMember[];
  managers: MockManager[];
  dashboardConfig: string;
  notificationsSettings: MockNotificationsSettings;
  inspirationHistory: MockInspirationHistoryEntry[];
  autoRetweetLinks: MockAutoRetweetLink[];
  feedback: MockFeedbackEntry[];
  nextId: number;
};

// ===== USER TYPES =====
export type MockUser = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  profilePicture: string;
  hasChosenSubscription: boolean;
  hasPaidSubscription: boolean;
  hasToChangePassword: boolean;
  hasSetupUsers: boolean;
  hasSetupEmail: boolean;
  isTrial: boolean;
  tier: ETiers;
  userType: EUserType;
  accounts: string[];
};

export type MockAccount = {
  id: string;
  accountType: EProviders;
  username: string;
  photoUrl: string;
  isExpired: boolean;
};

export type MockDraft = {
  id: string;
  index: number;
  text: string;
  poll: { durationMins: number; options: string[] } | null;
  twitterDirectLink: boolean;
  gifLink: string | null;
  imageLinks: string[];
  createdAt: string;
  onTwitter: boolean;
  onLinkedIn: boolean;
  asEvergreen: boolean;
  scheduleDate: string;
  isDraft: boolean;
  isTemplate: boolean;
  addFinisher: boolean;
};

export type MockTemplate = {
  id: string;
  index: number;
  text: string;
  poll: { durationMins: number; options: string[] } | null;
  twitterDirectLink: boolean;
  gifLink: string | null;
  imageLinks: string[];
  createdAt: string;
  onTwitter: boolean;
  onLinkedIn: boolean;
  asEvergreen: boolean;
  scheduleDate: string;
  isDraft: boolean;
  isTemplate: boolean;
  addFinisher: boolean;
};

export type MockCalendarEvent = {
  id: string;
  title: string;
  type: EPostSpotType;
  days: number[];
  start: string;
  startTime: string;
  forTwitter: boolean;
  forLinkedIn: boolean;
  postId: string;
};

export type MockCalendarSpot = {
  id: string;
  title: string;
  type: EPostSpotType;
  start: string;
  startTime: string;
  forTwitter: boolean;
  forLinkedIn: boolean;
  postId: string | null;
  daysOfWeek: number[] | null;
};

export type MockRecurringPost = {
  id: string;
  type: EPostSpotType;
  title: string;
  daysOfWeek: number[];
  forTwitter: boolean;
  forLinkedIn: boolean;
  startTime: string;
};

export type MockPostHistoryEntry = {
  id: string;
  impressions: number;
  likes: number;
  replies: number;
  retweets: number;
  twitterId: string;
  linkedInId: string;
  reminder: string;
  draft: boolean;
  template: boolean;
  onTwitter: boolean;
  onLinkedIn: boolean;
  index: number;
  text: string;
  pollOptions: string[];
  durationMinutes: number;
  twitterDirectLink: boolean;
  videoLink: string;
  gifLink: string;
  images: string[];
  mainPostId: string;
  createdAt: string;
};

export type MockScheduledPost = {
  id: string;
  onTwitter: boolean;
  onLinkedIn: boolean;
  asEvergreen: boolean;
  scheduleDate: string;
  isDraft: boolean;
  isTemplate: boolean;
  addFinisher: boolean;
  posts: MockPostFormPost[];
};

export type MockPostFormPost = {
  id: string | null;
  index: number;
  text: string;
  poll: { durationMins: number; options: string[] } | null;
  twitterDirectLink: boolean;
  gifLink: string | null;
  imageLinks: string[];
  createdAt: string | null;
};

export type MockNote = {
  id: string;
  name: string;
  content: string;
};

export type MockTicket = {
  id: string;
  title: string;
  type: ETicketType;
  status: ETicketStatus;
  priority: ETicketPriority;
  createdAt: string;
  lastUpdateAt: string;
};

export type MockTicketDetails = {
  id: string;
  context: string;
  responses: { id: string; response: string; writtenAt: string; writtenBy: string }[];
  title: string;
  type: number;
  status: number;
  priority: number;
  createdAt: string;
  lastUpdateAt: string;
};

export type MockNotification = {
  id: string;
  type: ENotificationType;
  text: string;
  streak: string | null;
  isRead: boolean;
};

export type MockPowerups = {
  autoPlug: {
    activate: boolean;
    autoPlugMessages: { id: string; message: string; media: string; mediaFile: string }[];
    condition: number;
    conditionValue: number;
  };
  selfRetweet: {
    activate: boolean;
    delayHours: number;
    condition: number;
    conditionValue: number;
  };
  autoRetweetLinks: { userName: string; accountId: string }[];
  emptySpotsActAsEvergreen: boolean;
  splitLongTextToThreads: boolean;
  expandThreadsAfterThreeLines: boolean;
};

export type MockFinisher = {
  finisherText: string;
  finisherImage: string;
};

export type MockProfile = {
  fullName: string;
  email: string;
  photoUrl: string;
};

export type MockSubscription = {
  id: string;
  tier: ETiers;
  payingDate: string;
  renewalDate: string;
  notificationDate: string;
  seats: number;
  usedSeats: number;
  subscriptionPrice: number;
  isNotified: boolean;
  isPendingSuspension: boolean;
  isPendingDeletion: boolean;
  deletionDate: string;
  yearly: boolean;
  isTrial: boolean;
  history: { dateOfPayment: string; seatsPaid: number; subscribed: string[] }[];
};

export type MockTeamMember = {
  id: string;
  fullName: string;
  photoUrl: string;
  userType: EUserType;
  email: string;
};

export type MockManager = {
  id: string;
  fullName: string;
  photoUrl: string;
  userType: number;
  subbordinates: { id: string; fullName: string; photoUrl: string; userType: number; subbordinates: [] }[];
};

export type MockNotificationsSettings = {
  whenPostsFailToPublish: boolean;
  weeklyReport: boolean;
  dailyReport: boolean;
  whenQueueIsEmpty: boolean;
  renewalNotifications: boolean;
  thanksForSubscription: boolean;
};

export type MockInspirationHistoryEntry = {
  id: string;
  request: string;
  response: string;
  createdAt: string;
};

export type MockAutoRetweetLink = {
  userName: string;
  accountId: string;
};

export type MockFeedbackEntry = {
  id: string;
  stars: number;
  comment: string;
  createdAt: string;
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export function createSeedData(): MockDB {
  const userId = "user_1";
  const twitterAccountId = "acc_twitter_1";
  const linkedinAccountId = "acc_linkedin_1";
  const token = "mock_jwt_token_" + generateId();

  return {
    nextId: 100,
    users: [
      {
        id: userId,
        fullName: "Alex Johnson",
        email: "demo@postlyy.com",
        password: "Demo123!",
        accessToken: token,
        refreshToken: "mock_refresh_" + generateId(),
        profilePicture: "https://api.dicebear.com/10.x/big-ears-neutral/svg?seed=Felix",
        hasChosenSubscription: true,
        hasPaidSubscription: true,
        hasToChangePassword: false,
        hasSetupUsers: true,
        hasSetupEmail: true,
        isTrial: false,
        tier: ETiers.Expert,
        userType: EUserType.Owner,
        accounts: [twitterAccountId, linkedinAccountId],
      },
    ],
    accounts: [
      {
        id: twitterAccountId,
        accountType: EProviders.Twitter,
        username: "@alexj_dev",
        photoUrl: "https://api.dicebear.com/10.x/big-ears-neutral/svg?seed=Felix",
        isExpired: false,
      },
      {
        id: linkedinAccountId,
        accountType: EProviders.Linkedin,
        username: "Alex Johnson",
        photoUrl: "https://api.dicebear.com/10.x/big-ears-neutral/svg?seed=Felix",
        isExpired: false,
      },
    ],
    drafts: [
      {
        id: "draft_1",
        index: 0,
        text: "Excited to announce our new feature release! We've been working hard on this and can't wait for you to try it out. 🚀 #tech #innovation",
        poll: null,
        twitterDirectLink: false,
        gifLink: null,
        imageLinks: [],
        createdAt: daysAgo(1),
        onTwitter: true,
        onLinkedIn: true,
        asEvergreen: false,
        scheduleDate: daysFromNow(2),
        isDraft: true,
        isTemplate: false,
        addFinisher: false,
      },
      {
        id: "draft_2",
        index: 0,
        text: "Just finished reading an amazing book on distributed systems. Here are my top 3 takeaways:\n\n1. Embrace eventual consistency\n2. Design for failure\n3. Monitor everything\n\nWhat books are you reading right now?",
        poll: null,
        twitterDirectLink: false,
        gifLink: null,
        imageLinks: ["https://picsum.photos/seed/book/800/600"],
        createdAt: daysAgo(2),
        onTwitter: true,
        onLinkedIn: true,
        asEvergreen: true,
        scheduleDate: "",
        isDraft: true,
        isTemplate: false,
        addFinisher: true,
      },
    ],
    templates: [
      {
        id: "tmpl_1",
        index: 0,
        text: "Tip of the day: [Insert your tip here]. Try it out and let me know how it works for you! 💡",
        poll: null,
        twitterDirectLink: false,
        gifLink: null,
        imageLinks: [],
        createdAt: daysAgo(10),
        onTwitter: true,
        onLinkedIn: false,
        asEvergreen: false,
        scheduleDate: "",
        isDraft: false,
        isTemplate: true,
        addFinisher: false,
      },
      {
        id: "tmpl_2",
        index: 0,
        text: "I'm thrilled to share that [achievement]! This milestone wouldn't have been possible without [people/team]. Thank you for your continued support! 🙏",
        poll: null,
        twitterDirectLink: false,
        gifLink: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDBhNjQ1ZjU5YzI0ZjQ1Njc4ZjQ1MjM0Njc4ZjQ1MjM0Njc4ZjQ1MjM0/source.gif",
        imageLinks: [],
        createdAt: daysAgo(15),
        onTwitter: true,
        onLinkedIn: true,
        asEvergreen: false,
        scheduleDate: "",
        isDraft: false,
        isTemplate: true,
        addFinisher: true,
      },
    ],
    calendarEvents: [
      {
        id: "evt_1",
        title: "Product Launch Thread",
        type: EPostSpotType.Scheduled,
        days: [1, 3, 5],
        start: daysAgo(0),
        startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
        forTwitter: true,
        forLinkedIn: true,
        postId: "post_1",
      },
      {
        id: "evt_2",
        title: "Weekly Industry Insights",
        type: EPostSpotType.Recurring,
        days: [2, 4],
        start: daysAgo(7),
        startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        forTwitter: true,
        forLinkedIn: false,
        postId: "post_2",
      },
      {
        id: "evt_3",
        title: "Weekend Engagement Post",
        type: EPostSpotType.Evergreen,
        days: [6, 0],
        start: daysAgo(3),
        startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
        forTwitter: false,
        forLinkedIn: true,
        postId: "post_3",
      },
    ],
    calendarSpots: [
      {
        id: "spot_1",
        title: "Monday Morning Motivation",
        type: EPostSpotType.Scheduled,
        start: daysFromNow(1),
        startTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
        forTwitter: true,
        forLinkedIn: true,
        postId: null,
        daysOfWeek: null,
      },
      {
        id: "spot_2",
        title: "Tech News Roundup",
        type: EPostSpotType.Recurring,
        start: daysFromNow(0),
        startTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
        forTwitter: true,
        forLinkedIn: true,
        postId: null,
        daysOfWeek: [1, 3, 5],
      },
      {
        id: "spot_3",
        title: "Thought Leadership",
        type: EPostSpotType.Evergreen,
        start: daysFromNow(3),
        startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        forTwitter: true,
        forLinkedIn: true,
        postId: null,
        daysOfWeek: null,
      },
    ],
    recurringPosts: [
      {
        id: "recur_1",
        type: EPostSpotType.Recurring,
        title: "Weekly Tech Tips",
        daysOfWeek: [2, 4],
        forTwitter: true,
        forLinkedIn: false,
        startTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
      },
      {
        id: "recur_2",
        type: EPostSpotType.Recurring,
        title: "Friday Fun",
        daysOfWeek: [5],
        forTwitter: true,
        forLinkedIn: true,
        startTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
      },
    ],
    postHistory: [
      {
        id: "ph_1",
        impressions: 15420,
        likes: 892,
        replies: 134,
        retweets: 267,
        twitterId: "tweet_123",
        linkedInId: "li_post_123",
        reminder: "",
        draft: false,
        template: false,
        onTwitter: true,
        onLinkedIn: true,
        index: 0,
        text: "Our team just hit 10K users! 🎉 Thank you to everyone who believed in our vision. This is just the beginning! #startup #growth #milestone",
        pollOptions: [],
        durationMinutes: 0,
        twitterDirectLink: false,
        videoLink: "",
        gifLink: "",
        images: [],
        mainPostId: "",
        createdAt: daysAgo(5),
      },
      {
        id: "ph_2",
        impressions: 8750,
        likes: 445,
        replies: 89,
        retweets: 156,
        twitterId: "tweet_456",
        linkedInId: "li_post_456",
        reminder: "",
        draft: false,
        template: false,
        onTwitter: true,
        onLinkedIn: false,
        index: 0,
        text: "Hot take: The best code is the code you don't write. Focus on architecture, not lines of code. What's your take?",
        pollOptions: ["Strongly agree", "Agree", "Neutral", "Disagree"],
        durationMinutes: 1440,
        twitterDirectLink: false,
        videoLink: "",
        gifLink: "",
        images: [],
        mainPostId: "",
        createdAt: daysAgo(12),
      },
      {
        id: "ph_3",
        impressions: 32000,
        likes: 2100,
        replies: 340,
        retweets: 580,
        twitterId: "tweet_789",
        linkedInId: "li_post_789",
        reminder: "",
        draft: false,
        template: false,
        onTwitter: true,
        onLinkedIn: true,
        index: 0,
        text: "Thread: Everything I learned building a SaaS to $10K MRR 🧵\n\n1/ Start with a problem YOU have\n2/ Talk to 100 potential users\n3/ Launch before you're ready\n4/ Iterate based on feedback\n5/ Charge from day one",
        pollOptions: [],
        durationMinutes: 0,
        twitterDirectLink: false,
        videoLink: "",
        gifLink: "",
        images: ["https://picsum.photos/seed/saas/800/600"],
        mainPostId: "",
        createdAt: daysAgo(20),
      },
    ],
    scheduledPosts: [
      {
        id: "sp_1",
        onTwitter: true,
        onLinkedIn: true,
        asEvergreen: false,
        scheduleDate: daysFromNow(2),
        isDraft: false,
        isTemplate: false,
        addFinisher: true,
        posts: [
          {
            id: "sp_post_1",
            index: 0,
            text: "We're thrilled to announce our integration with @NotionHQ! Now you can sync your content calendar directly. Link in bio! #productivity #integration",
            poll: null,
            twitterDirectLink: false,
            gifLink: null,
            imageLinks: [],
            createdAt: daysAgo(0),
          },
        ],
      },
    ],
    notes: [
      {
        id: "note_1",
        name: "Content Ideas for March",
        content: "1. Spring cleaning tips for social media\n2. Case study: How we grew 300%\n3. Behind the scenes of our latest feature\n4. User spotlight series kickoff\n5. Industry predictions for Q2",
      },
      {
        id: "note_2",
        name: "Brand Voice Guidelines",
        content: "Tone: Professional but approachable\nKey phrases: 'We believe', 'Our community', 'Together we can'\nAvoid: Jargon, overly technical terms\nEmojis: Use sparingly, mostly in Twitter posts\nHashtags: Max 3 per post",
      },
    ],
    tickets: [
      {
        id: "ticket_1",
        title: "Billing inquiry - incorrect charge",
        type: ETicketType.Problem,
        status: ETicketStatus.InProgress,
        priority: ETicketPriority.High,
        createdAt: daysAgo(3),
        lastUpdateAt: daysAgo(1),
      },
      {
        id: "ticket_2",
        title: "Feature request: Bulk scheduling",
        type: ETicketType.FeatureRequest,
        status: ETicketStatus.Open,
        priority: ETicketPriority.Medium,
        createdAt: daysAgo(7),
        lastUpdateAt: daysAgo(7),
      },
    ],
    ticketDetails: [
      {
        id: "ticket_1",
        context: "I was charged $49 instead of the $29 Pro plan. Can you please check and correct this?",
        responses: [
          {
            id: "resp_1",
            response: "Hi! Thank you for reaching out. I can see you were upgraded to the Expert plan. Let me check and get back to you shortly.",
            writtenAt: daysAgo(2),
            writtenBy: "Sarah (Support)",
          },
          {
            id: "resp_2",
            response: "I've corrected the charge. The $20 difference has been refunded to your account. Sorry for the inconvenience!",
            writtenAt: daysAgo(1),
            writtenBy: "Sarah (Support)",
          },
        ],
        title: "Billing inquiry - incorrect charge",
        type: ETicketType.Problem,
        status: ETicketStatus.InProgress,
        priority: ETicketPriority.High,
        createdAt: daysAgo(3),
        lastUpdateAt: daysAgo(1),
      },
      {
        id: "ticket_2",
        context: "It would be great to have the ability to schedule multiple posts at once instead of one by one.",
        responses: [],
        title: "Feature request: Bulk scheduling",
        type: ETicketType.FeatureRequest,
        status: ETicketStatus.Open,
        priority: ETicketPriority.Medium,
        createdAt: daysAgo(7),
        lastUpdateAt: daysAgo(7),
      },
    ],
    notifications: [
      {
        id: "notif_1",
        type: ENotificationType.Stats,
        text: "Your post '10K Users' reached 15K impressions! 🎉",
        streak: null,
        isRead: false,
      },
      {
        id: "notif_2",
        type: ENotificationType.DayStreak,
        text: "You've posted for 5 days in a row! Keep it up! 🔥",
        streak: "5",
        isRead: false,
      },
      {
        id: "notif_3",
        type: ENotificationType.WeeklyStreak,
        text: "Amazing! You've maintained a 3-week posting streak!",
        streak: "3",
        isRead: true,
      },
      {
        id: "notif_4",
        type: ENotificationType.Reminder,
        text: "Your queue is running low. Add more posts to keep your schedule consistent!",
        streak: null,
        isRead: true,
      },
      {
        id: "notif_5",
        type: ENotificationType.Normal,
        text: "Welcome to Postlyy! Complete your profile to get the most out of the platform.",
        streak: null,
        isRead: true,
      },
    ],
    powerups: {
      autoPlug: {
        activate: true,
        autoPlugMessages: [
          {
            id: "plug_1",
            message: "Check out our new feature! 🚀 postlyy.com/features",
            media: "",
            mediaFile: "",
          },
          {
            id: "plug_2",
            message: "Loving Postlyy? Share it with your network!",
            media: "",
            mediaFile: "",
          },
        ],
        condition: 0,
        conditionValue: 3,
      },
      selfRetweet: {
        activate: false,
        delayHours: 24,
        condition: 0,
        conditionValue: 5,
      },
      autoRetweetLinks: [
        { userName: "@postlyy", accountId: twitterAccountId },
      ],
      emptySpotsActAsEvergreen: true,
      splitLongTextToThreads: true,
      expandThreadsAfterThreeLines: false,
    },
    finisher: {
      finisherText: "Built with ❤️ by the Postlyy team. Try it free at postlyy.com",
      finisherImage: "",
    },
    profile: {
      fullName: "Alex Johnson",
      email: "demo@postlyy.com",
      photoUrl: "https://api.dicebear.com/10.x/big-ears-neutral/svg?seed=Felix",
    },
    subscription: {
      id: "sub_1",
      tier: ETiers.Pro,
      payingDate: daysAgo(60),
      renewalDate: daysFromNow(30),
      notificationDate: daysFromNow(25),
      seats: 3,
      usedSeats: 1,
      subscriptionPrice: 29,
      isNotified: false,
      isPendingSuspension: false,
      isPendingDeletion: false,
      deletionDate: "",
      yearly: false,
      isTrial: false,
      history: [
        {
          dateOfPayment: daysAgo(60),
          seatsPaid: 1,
          subscribed: ["Alex Johnson"],
        },
      ],
    },
    team: [
      {
        id: "member_1",
        fullName: "Alex Johnson",
        photoUrl: "https://api.dicebear.com/10.x/big-ears-neutral/svg?seed=Felix",
        userType: EUserType.Owner,
        email: "demo@postlyy.com",
      },
    ],
    managers: [
      {
        id: "manager_1",
        fullName: "Alex Johnson",
        photoUrl: "https://api.dicebear.com/10.x/big-ears-neutral/svg?seed=Felix",
        userType: EUserType.Owner,
        subbordinates: [],
      },
    ],
    dashboardConfig: JSON.stringify([
      {
        i: "stat-1",
        x: 0,
        y: 0,
        w: 3,
        h: 1,
        minW: 3,
        minH: 1,
        title: "Total Impressions",
        type: "stat",
        query: 0,
        aggregation: 2,
        provider: 0,
      },
      {
        i: "stat-2",
        x: 3,
        y: 0,
        w: 3,
        h: 1,
        minW: 3,
        minH: 1,
        title: "Total Likes",
        type: "stat",
        query: 1,
        aggregation: 2,
        provider: 0,
      },
      {
        i: "graph-1",
        x: 0,
        y: 1,
        w: 6,
        h: 2,
        minW: 3,
        minH: 2,
        title: "Impressions Over Time",
        type: "graph",
        query: 0,
        aggregation: 1,
        provider: 0,
      },
      {
        i: "posts-stats-1",
        x: 0,
        y: 3,
        w: 6,
        h: 3,
        minW: 3,
        minH: 2,
        title: "Post Performance",
        type: "posts-stats",
        query: 7,
        aggregation: 2,
        provider: 0,
      },
      {
        i: "calendar-1",
        x: 6,
        y: 0,
        w: 3,
        h: 3,
        minW: 3,
        minH: 2,
        title: "Upcoming Posts",
        type: "events-calendar",
        query: 8,
        aggregation: 0,
        provider: 0,
      },
    ]),
    notificationsSettings: {
      whenPostsFailToPublish: true,
      weeklyReport: true,
      dailyReport: false,
      whenQueueIsEmpty: true,
      renewalNotifications: true,
      thanksForSubscription: true,
    },
    inspirationHistory: [],
    autoRetweetLinks: [
      { userName: "@postlyy", accountId: twitterAccountId },
    ],
    feedback: [],
  };
}