// Core domain types for Diiff.
// Separate from the auto-generated database.types.ts.

export type AgeTier = "minor" | "young_adult";

export interface UserCapabilities {
  canCreateRoom: boolean;
  canJoinUnmoderatedRoom: boolean;
  canViewAdultContent: boolean;
  canUseConversationalAI: boolean;
  canSendDMs: boolean;
}

export class CapabilityError extends Error {
  constructor(public readonly capability: keyof UserCapabilities) {
    super(`Capability denied: ${capability}`);
    this.name = "CapabilityError";
  }
}

export class AuthError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthError";
  }
}

export type PostType = "spirit" | "move" | "community" | "wellness";
export type Audience = "all_ages" | "adults_only";
export type ModerationStatus = "pending" | "approved" | "removed" | "flagged";
export type AccountStatus = "active" | "pending_consent" | "suspended" | "banned";
export type AuthProvider = "google" | "apple";
export type RoomType = "all_ages_moderated" | "adults_only";
export type RoomStatus = "scheduled" | "live" | "closed";
export type StreakType = "move" | "devotional";
export type FlagSource = "automated" | "user_report" | "staff";
export type FlagCategory = "sexual" | "self_harm" | "hate" | "grooming" | "spam" | "other";
export type FlagSeverity = "low" | "medium" | "high" | "critical";
export type FlagOutcome = "pending" | "approved" | "removed" | "warned" | "escalated" | "dismissed";
export type PlanType = "cardio" | "strength" | "flexibility" | "breathwork";

export interface User {
  id: string;
  display_name: string;
  date_of_birth?: string;
  age_tier: AgeTier;
  city: string | null;
  state: string | null;
  bio: string | null;
  avatar_url: string | null;
  auth_provider: AuthProvider;
  parental_consent_at: string | null;
  account_status: AccountStatus;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  audience: Audience;
  media_url: string | null;
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
  author?: Pick<User, "id" | "display_name" | "avatar_url" | "city">;
  reactions?: { count: number }[];
  comments?: { count: number }[];
}

export interface Room {
  id: string;
  creator_id: string;
  title: string;
  topic: string | null;
  room_type: RoomType;
  status: RoomStatus;
  opened_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  streak_type: StreakType;
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
}

export interface Badge {
  id?: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  created_at?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface ModerationFlag {
  id: string;
  target_type: "post" | "comment" | "room" | "user" | "voice_segment";
  target_id: string;
  flag_source: FlagSource;
  category: FlagCategory;
  severity: FlagSeverity;
  reporter_id: string | null;
  reviewer_id: string | null;
  outcome: FlagOutcome;
  notes: string | null;
  created_at: string;
}

export interface MovePlan {
  id: string;
  title: string;
  description?: string;
  plan_type: PlanType;
  scripture_reference: string;
  duration_minutes: number;
  created_at?: string;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}
