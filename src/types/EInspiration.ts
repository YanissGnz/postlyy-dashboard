export enum EInspirationTone {
  Normal = 0,
  Informative = 1,
  Promotional = 2,
  Educational = 3,
  Conversational = 4,
  Persuasive = 5,
  Motivational = 6,
  Inspirational = 7,
  Emotional = 8,
  Urgent = 9,
  Appreciative = 10,
  Personalized = 11,
}

export enum EInspirationFormality {
  Normal = 0,
  Casual = 1,
  SemiFormal = 2,
  Formal = 3,
}

export enum EInspirationPostType {
  Draft = 0,
  Note = 1,
}

export enum EInspirationType {
  FromKeywords = 0,
  FromPost = 1,
  Reformulation = 2,
}

export const InspirationToneOptions = [
  { value: EInspirationTone.Normal, label: "Normal" },
  { value: EInspirationTone.Informative, label: "Informative" },
  { value: EInspirationTone.Promotional, label: "Promotional" },
  { value: EInspirationTone.Educational, label: "Educational" },
  { value: EInspirationTone.Conversational, label: "Conversational" },
  { value: EInspirationTone.Persuasive, label: "Persuasive" },
  { value: EInspirationTone.Motivational, label: "Motivational" },
  { value: EInspirationTone.Inspirational, label: "Inspirational" },
  { value: EInspirationTone.Emotional, label: "Emotional" },
  { value: EInspirationTone.Urgent, label: "Urgent" },
  { value: EInspirationTone.Appreciative, label: "Appreciative" },
  { value: EInspirationTone.Personalized, label: "Personalized" },
];

export const InspirationFormalityOptions = [
  { value: EInspirationFormality.Normal, label: "Normal" },
  { value: EInspirationFormality.Casual, label: "Casual" },
  { value: EInspirationFormality.SemiFormal, label: "Semi-Formal" },
  { value: EInspirationFormality.Formal, label: "Formal" },
];

export const InspirationPostTypeOptions = [
  { value: EInspirationPostType.Draft, label: "Draft" },
  { value: EInspirationPostType.Note, label: "Note" },
];

export const InspirationTypeOptions = [
  { value: EInspirationType.FromKeywords, label: "From Keywords" },
  { value: EInspirationType.FromPost, label: "From Post" },
  { value: EInspirationType.Reformulation, label: "Reformulation" },
];

export const InspirationAudienceOptions = [
  {
    value: "general",
    label: "General",
    options: [
      { value: "general", label: "General" },
      { value: "business", label: "Business" },
      { value: "education", label: "Education" },
      { value: "entertainment", label: "Entertainment" },
      { value: "finance", label: "Finance" },
      { value: "food", label: "Food" },
      { value: "health", label: "Health" },
      { value: "lifestyle", label: "Lifestyle" },
      { value: "news", label: "News" },
      { value: "politics", label: "Politics" },
      { value: "science", label: "Science" },
      { value: "sports", label: "Sports" },
      { value: "technology", label: "Technology" },
      { value: "travel", label: "Travel" },
      { value: "weather", label: "Weather" },
    ],
  },
  {
    value: "age",
    label: "Age",
    options: [
      { value: "18-24", label: "18-24" },
      { value: "25-34", label: "25-34" },
      { value: "35-44", label: "35-44" },
      { value: "45-54", label: "45-54" },
      { value: "55-64", label: "55-64" },
      { value: "65+", label: "65+" },
    ],
  },
];
