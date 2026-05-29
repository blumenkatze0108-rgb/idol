export interface IdolPersona {
  name: string;
  stageName: string;
  gender: "female" | "male";
  style: "solo" | "group";
  groupName: string;
  roleInGroup: string; // e.g. "Main Vocal & Leader", "Center", "Maknae & Lead Dancer"
  hairStyle: string;
  hairColor: string;
  mbti: string;
  conceptTheme: string; // "Cyberpunk" | "High Teen" | "Dark Gothic" | "Bright Cute"
  company: string; // Agency name
  vibeText: string; // Custom description of look/vibe

  // Starting State selection
  startType: "trainee" | "idol"; // "练习生" vs "正式偶像"
  nationality: "korean" | "chinese_green" | "japanese_green" | "thai_green" | "western_green"; // 国籍选择
  
  // Extra detailed profile options (Requirement 5 & 1)
  birthday: string;
  zodiac: string;
  age?: number;
  bloodType: string;
  specificNationality: string;
  isMixed: boolean;
  mixedCountries: string;
  eyeShape: string;
  eyeColor: string;
  noseShape: string;
  
  // Physical & Self-Care Stats (NEW)
  height: number; // in cm
  weight: number; // in kg
  skinCondition: "perfect" | "glowing" | "troubled" | "exhausted" | "breakout"; // 皮肤状态
  vocalSkill: number; // Vocal Skill 0-100
  danceSkill: number; // Dance Skill 0-100
  rapSkill: number; // Rap Skill 0-100
  varietySkill: number; // Variety/Speech Skill 0-100
  stress: number; // Stress levels 0-100 (high stress reduces skin quality/health)
  
  // Financial Systems (NEW)
  traineeDebt: number; // Training debt (₩ ten thousand, e.g. ₩15,000 for trainee)
  companySplit: string; // Earnings split (e.g., "9:1", "8:2", "7:3")

  // Favorability Systems (Goodwill scores for entities 0-100)
  managerFavorability: number; 
  teammatesFavorability: number; 
  ceoFavorability: number; 
  pdFavorability: number;

  // Raw interactive stats
  popularity: number; // 0-100
  reputation: number; // 0-100
  energy: number; // 0-100: stamina, restored daily or via sleeping/eating
  fansCount: number; // Follower count
  albumSales: number; // Cumulative physical album sales
  money: number; // Cash asset (₩ ten thousand, payout only after debt cleared)
  dayNumber: number; // Current simulation day
  
  // Romance Option - Requirement & Custom Option
  hasLover?: boolean;
  loverName?: string;
  relationshipStatus?: "single" | "dating" | "revealed" | "broken_up";
  scandalPrejudice?: number; // 0-100 (risk of popping up scandal)
  loverGender?: "female" | "male";
  loverAge?: "same_age" | "older" | "younger";
  loverIdentity?: "non_celeb" | "celebrity";
  loverMood?: number; // 0-100: Relationship stability/mood.
  
  
  // Fans Distribution (Slowly changing, OT vs Solo vs CP vs Anti)
  fansDistribution?: {
    otFans: number;   // 团粉 %
    soloFans: number; // 唯粉/毒唯 %
    cpFans: number;   // CP粉 %
    antiFans: number; // 黑粉 %
  };
}

// Generated teammates list for groups
export interface SimulatedTeammate {
  id: string;
  name: string;
  stageName: string;
  mbti: string;
  role: string;
  nationality: string;
  favorability: number; // 0-100
  trait: string; // e.g. "Arrogant genius", "Clumsy vocal", "Quiet listener"
  avatar: string;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  role: "manager" | "member" | "celeb" | "fan" | "ceo" | "sibling";
  lastMessage: string;
  unread: boolean;
  time: string;
  mbti?: string;
  summary?: string; // Dialogue short summary for token saving
  favorability?: number; // link to favorability scores
}

export interface ChatMessage {
  id: string;
  sender: "idol" | "other" | "system";
  text: string;
  time: string;
  queueOnly?: boolean; // queued for "All AI Reply" batch mode
}

export interface WeverseComment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  time: string;
  replied?: boolean;
  replyText?: string;
  fanType?: "OT_fan" | "solo_stan" | "evil_stan" | "shipper" | "sasaeng" | "delusion" | "anti"; // hidden types for realistic parsing
}

export interface WeversePost {
  id: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  time: string;
  comments: WeverseComment[];
}

export interface BubbleMessage {
  id: string;
  sender: "idol" | "fan_mass" | "system";
  text: string;
  time: string;
  fanReplies?: { author: string; text: string; fanType?: string }[];
}

export interface TikTokVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  musicName: string;
  vocalState?: string;
}

export interface XiaohongshuPost {
  id: string;
  title: string;
  content: string;
  likes: number;
  stars: number;
  comments: number;
  time: string;
}

export interface SystemEvent {
  id: string;
  title: string;
  description: string;
  type: "positive" | "warning" | "challenge" | "neutral";
  choices: {
    text: string;
    popularityEffect?: number;
    reputationEffect?: number;
    energyEffect?: number;
    moneyEffect?: number;
    stressEffect?: number; // stress impact
    debtChange?: number; // training debt impact
    managerChange?: number; // relationship impacts
    teammateChange?: number;
    ceoFavorability?: number;
    pdFavorability?: number;
    outcomeText: string;
  }[];
}

export interface IdolSchedule {
  id: string;
  time: string;
  title: string;
  category: "music_show" | "practice" | "fansign" | "vocal_lesson" | "variety_show" | "cf_shoot" | "concert" | "clinical_dermatology" | "restrictive_diet" | "rest_sleep";
  rewardPopularity: number;
  rewardReputation: number;
  energyCost: number;
  completed: boolean;
}

export interface FandomDivision {
  OT_fan: number; // 团粉 percentage
  solo_stan: number; // 唯粉 percentage
  evil_stan: number; // 毒唯 percentage
  shipper: number; // CP粉 percentage
  sasaeng: number; // 私生粉 percentage
  delusion: number; // 梦男梦女 percentage
  anti: number; // 黑粉 percentage
}

export interface BackupData {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  chatHistories: Record<string, ChatMessage[]>;
  weversePosts: WeversePost[];
  bubbleMessages: BubbleMessage[];
  schedules: IdolSchedule[];
  tickTokVideos: TikTokVideo[];
  xiaohongshuPosts: XiaohongshuPost[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  fanLetters?: any[]; // Keep any or FanLetter here safely
}
