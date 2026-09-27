export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface UserResponse {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  avatarUrl?: string;
  isKids: boolean;
  languagePreference?: string;
  maturitySetting?: string;
}

export interface UserSummaryResponse {
  user: UserResponse;
  activePlanName?: string;
  hasActiveSubscription: boolean;
  profileCount: number;
  unreadNotificationsCount: number;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: UserResponse;
}

export interface SignUpResponseData {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

export type UserProfile = ProfileResponse;

