export interface GenreResponse {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

export interface PersonResponse {
  id: string;
  name: string;
  profileImageUrl?: string;
  biography?: string;
}

export interface CastMemberResponse {
  id: string;
  person: PersonResponse;
  role: string;
  characterName?: string;
}

export interface EpisodeResponse {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  durationMinutes?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface SeasonResponse {
  id: string;
  seasonNumber: number;
  title?: string;
  episodes?: EpisodeResponse[];
}

export interface ContentAssetResponse {
  id: string;
  assetType: string;
  url: string;
  quality?: string;
  language?: string;
  isPrimary: boolean;
}

export interface ContentResponse {
  id: string;
  contentType: "MOVIE" | "SERIES";
  title: string;
  description: string;
  releaseYear: number;
  maturityRating?: string;
  durationMinutes?: number;
  posterUrl: string;
  videoUrl?: string;
  trailerUrl?: string;
  averageRating?: number;
  genres: (GenreResponse | string)[];
  seasons?: SeasonResponse[];
  assets?: ContentAssetResponse[];
}

// Backward compatible Movie alias
export type Movie = ContentResponse;

export interface MovieFilters {
  genre?: string;
  country?: string;
  search?: string;
  type?: "MOVIE" | "SERIES";
  sortBy?: "rating" | "releaseYear" | "title";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ReviewResponse {
  id: string;
  profileId: string;
  contentId: string;
  profileName?: string;
  profileAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  priceCents: number;
  maxVideoQuality: string;
  maxConcurrentStreams: number;
}

export interface SubscriptionResponse {
  id: string;
  userId: string;
  plan: SubscriptionPlanResponse;
  status: string;
  startedAt: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  paymentQrCode?: string;
  qrExpiresAt?: string;
}

export interface PaymentResponse {
  id: string;
  subscriptionId?: string;
  userEmail?: string;
  planName?: string;
  amountCents: number;
  status: string;
  providerRef?: string;
  paidAt: string;
}

export interface WatchlistResponse {
  id: string;
  profileId: string;
  // Backend returns flat fields:
  contentId?: string;
  contentTitle?: string;
  posterUrl?: string;
  addedAt: string;
  // Legacy/optional nested content (for compatibility)
  content?: ContentResponse;
}

export interface HistoryResponse {
  id: string;
  profileId: string;
  content: ContentResponse;
  episode?: EpisodeResponse;
  progressSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalContentItems: number;
  totalMovies: number;
  totalSeries: number;
  totalReviews: number;
  totalRevenueCents: number;
}

export interface AuditLogResponse {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  status?: "SUCCESS" | "FAILURE" | "WARNING" | string;
  createdAt: string;
}
