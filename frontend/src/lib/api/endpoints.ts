import { apiClient } from "./client";
import type { SpringPage } from "@/src/types/api";
import type {
  ContentResponse,
  GenreResponse,
  PersonResponse,
  CastMemberResponse,
  SeasonResponse,
  EpisodeResponse,
  ReviewResponse,
  SubscriptionPlanResponse,
  SubscriptionResponse,
  PaymentResponse,
  WatchlistResponse,
  HistoryResponse,
  AdminDashboardStats,
  ContentAssetResponse,
  AuditLogResponse,
  NotificationResponse,
} from "@/src/types/movie";
import type {
  UserResponse,
  ProfileResponse,
  UserSummaryResponse,
  LoginResponseData,
  SignUpResponseData,
} from "@/src/types/user";

// --- AUTH API ---
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient<LoginResponseData>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signup: (data: { email: string; password: string; displayName?: string; fullName?: string }) =>
    apiClient<SignUpResponseData>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullName: data.fullName || data.displayName || "",
      }),
    }),

  logout: (refreshToken: string) =>
    apiClient<void>(`/api/v1/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`, {
      method: "POST",
    }),

  resendVerificationEmail: (email: string) =>
    apiClient<void>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// --- USER API ---
export const userApi = {
  getMe: () => apiClient<UserResponse>("/api/v1/users/me"),
  getMySummary: () => apiClient<UserSummaryResponse>("/api/v1/users/me/summary"),
  updateUser: (data: { displayName: string; avatarUrl?: string }) =>
    apiClient<UserResponse>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// --- PROFILES API ---
export const profileApi = {
  getProfiles: () => apiClient<ProfileResponse[]>("/api/v1/profiles"),
  createProfile: (data: { name: string; avatarUrl?: string; isKids: boolean }) =>
    apiClient<ProfileResponse>("/api/v1/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteProfile: (profileId: string) =>
    apiClient<void>(`/api/v1/profiles/${profileId}`, {
      method: "DELETE",
    }),
};

// --- CATALOG & CONTENT API ---
export const catalogApi = {
  getContents: (page = 0, size = 20, type?: string) =>
    apiClient<SpringPage<ContentResponse>>("/api/v1/contents", {
      params: { page, size, type },
    }),

  getContentById: (id: string) =>
    apiClient<ContentResponse>(`/api/v1/contents/${id}`),

  getGenres: () => apiClient<GenreResponse[]>("/api/v1/genres"),

  getPersons: () => apiClient<PersonResponse[]>("/api/v1/catalog/persons"),

  getCast: (contentId: string) =>
    apiClient<CastMemberResponse[]>(`/api/v1/catalog/contents/${contentId}/cast`),

  getSeasons: (contentId: string) =>
    apiClient<SeasonResponse[]>(`/api/v1/catalog/contents/${contentId}/seasons`),

  getEpisodes: (seasonId: string) =>
    apiClient<EpisodeResponse[]>(`/api/v1/catalog/seasons/${seasonId}/episodes`),

  getContentAssets: (contentId: string) =>
    apiClient<ContentAssetResponse[]>(`/api/v1/content-assets/content/${contentId}`),
};

// --- REVIEWS API ---
export const reviewApi = {
  getReviews: (contentId: string) =>
    apiClient<ReviewResponse[]>(`/api/v1/contents/${contentId}/reviews`),

  submitReview: (profileId: string, data: { contentId: string; rating: number; comment?: string }) =>
    apiClient<ReviewResponse>(`/api/v1/profiles/${profileId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteReview: (profileId: string, reviewId: string) =>
    apiClient<void>(`/api/v1/profiles/${profileId}/reviews/${reviewId}`, {
      method: "DELETE",
    }),
};

// --- WATCHLIST API ---
export const watchlistApi = {
  getWatchlist: (profileId: string) =>
    apiClient<WatchlistResponse[]>(`/api/v1/profiles/${profileId}/watchlist`),

  addToWatchlist: (profileId: string, contentId: string) =>
    apiClient<WatchlistResponse>(`/api/v1/profiles/${profileId}/watchlist`, {
      method: "POST",
      body: JSON.stringify({ contentId }),
    }),

  removeFromWatchlist: (profileId: string, contentId: string) =>
    apiClient<void>(`/api/v1/profiles/${profileId}/watchlist/${contentId}`, {
      method: "DELETE",
    }),
};

// --- WATCH HISTORY API ---
export const historyApi = {
  getHistory: (profileId: string) =>
    apiClient<HistoryResponse[]>(`/api/v1/profiles/${profileId}/history`),

  saveProgress: (profileId: string, data: { contentId: string; episodeId?: string; progressSeconds: number; completed: boolean }) =>
    apiClient<HistoryResponse>(`/api/v1/profiles/${profileId}/history`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  clearHistory: (profileId: string) =>
    apiClient<void>(`/api/v1/profiles/${profileId}/history`, {
      method: "DELETE",
    }),
};

// --- SUBSCRIPTION API ---
export const subscriptionApi = {
  getPlans: () => apiClient<SubscriptionPlanResponse[]>("/api/v1/subscriptions/plans"),

  getMySubscriptions: () => apiClient<SubscriptionResponse[]>("/api/v1/subscriptions/me"),

  subscribe: (data: { planId: string; paymentMethodNonce?: string }) =>
    apiClient<SubscriptionResponse>("/api/v1/subscriptions/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSubscriptionStatus: (subscriptionId: string) =>
    apiClient<SubscriptionResponse>(`/api/v1/subscriptions/${subscriptionId}/status`),

  cancelSubscription: (subscriptionId: string) =>
    apiClient<SubscriptionResponse>(`/api/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    }),

  verifyPayment: (subscriptionId: string) =>
    apiClient<SubscriptionResponse>(`/api/v1/subscriptions/${subscriptionId}/verify-payment`, {
      method: "POST",
    }),
};

// --- ADMIN API ---
export const adminApi = {
  getDashboardStats: () => apiClient<AdminDashboardStats>("/api/v1/admin/dashboard"),

  getUsers: (page = 0, size = 20, role?: string) =>
    apiClient<SpringPage<UserResponse>>("/api/v1/admin/users", {
      params: { page, size, role },
    }),

  banUser: (userId: string) =>
    apiClient<void>(`/api/v1/admin/users/${userId}/ban`, { method: "POST" }),

  unbanUser: (userId: string) =>
    apiClient<void>(`/api/v1/admin/users/${userId}/unban`, { method: "POST" }),

  updateUserRole: (userId: string, role: string) =>
    apiClient<UserResponse>(`/api/v1/admin/users/${userId}/role?role=${role}`, {
      method: "PUT",
    }),

  deleteUser: (userId: string) =>
    apiClient<void>(`/api/v1/admin/users/${userId}`, { method: "DELETE" }),

  searchUsers: (query: string, page = 0, size = 20) =>
    apiClient<SpringPage<UserResponse>>("/api/v1/admin/users/search", {
      params: { query, page, size },
    }),

  getReviews: (page = 0, size = 20) =>
    apiClient<SpringPage<ReviewResponse>>("/api/v1/admin/reviews", {
      params: { page, size },
    }),

  deleteReview: (reviewId: string) =>
    apiClient<void>(`/api/v1/admin/reviews/${reviewId}`, { method: "DELETE" }),

  getSubscriptions: (page = 0, size = 20, status?: string) =>
    apiClient<SpringPage<SubscriptionResponse>>("/api/v1/admin/subscriptions", {
      params: { page, size, status },
    }),

  getUserSubscriptions: (userId: string) =>
    apiClient<SubscriptionResponse[]>(`/api/v1/admin/users/${userId}/subscriptions`),

  cancelSubscription: (subscriptionId: string) =>
    apiClient<SubscriptionResponse>(`/api/v1/admin/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    }),

  getPayments: (page = 0, size = 20) =>
    apiClient<SpringPage<PaymentResponse>>("/api/v1/admin/subscriptions/payments", {
      params: { page, size },
    }),

  // Subscription Plans (admin)
  getPlans: () =>
    apiClient<SubscriptionPlanResponse[]>("/api/v1/admin/subscriptions/plans"),

  createPlan: (data: { name: string; priceCents: number; maxVideoQuality: string; maxConcurrentStreams: number }) =>
    apiClient<SubscriptionPlanResponse>("/api/v1/admin/subscriptions/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updatePlan: (planId: string, data: { name: string; priceCents: number; maxVideoQuality: string; maxConcurrentStreams: number }) =>
    apiClient<SubscriptionPlanResponse>(`/api/v1/admin/subscriptions/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deletePlan: (planId: string) =>
    apiClient<void>(`/api/v1/admin/subscriptions/plans/${planId}`, {
      method: "DELETE",
    }),

  broadcastNotification: (title: string, message: string) =>
    apiClient<void>("/api/v1/admin/notifications/broadcast", {
      method: "POST",
      params: { title, message },
    }),

  createContent: (data: Record<string, unknown>) =>
    apiClient<ContentResponse>("/api/v1/admin/contents", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateContent: (id: string, data: Record<string, unknown>) =>
    apiClient<ContentResponse>(`/api/v1/admin/contents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteContent: (id: string) =>
    apiClient<void>(`/api/v1/admin/contents/${id}`, {
      method: "DELETE",
    }),

  createGenre: (data: { name: string; slug?: string; description?: string }) =>
    apiClient<GenreResponse>("/api/v1/admin/genres", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateGenre: (id: string, data: { name: string; slug?: string; description?: string }) =>
    apiClient<GenreResponse>(`/api/v1/admin/genres/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteGenre: (id: string) =>
    apiClient<void>(`/api/v1/admin/genres/${id}`, {
      method: "DELETE",
    }),

  getAuditLogs: () =>
    apiClient<AuditLogResponse[]>("/api/v1/admin/audit-logs"),

  createAuditLog: (payload: { action: string; targetType: string; targetId?: string; details?: string; status?: string }) =>
    apiClient<void>("/api/v1/admin/audit-logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  clearAuditLogs: () =>
    apiClient<void>("/api/v1/admin/audit-logs", {
      method: "DELETE",
    }),
};

export const notificationApi = {
  getNotifications: () =>
    apiClient<NotificationResponse[]>("/api/v1/notifications"),

  getUnreadCount: () =>
    apiClient<number>("/api/v1/notifications/unread-count"),

  markAsRead: (id: string) =>
    apiClient<void>(`/api/v1/notifications/${id}/read`, {
      method: "PUT",
    }),

  markAllAsRead: () =>
    apiClient<void>("/api/v1/notifications/read-all", {
      method: "PUT",
    }),

  deleteNotification: (id: string) =>
    apiClient<void>(`/api/v1/notifications/${id}`, {
      method: "DELETE",
    }),

  broadcastNotification: (params: { title: string; message: string; type?: string }) =>
    apiClient<void>(
      `/api/v1/admin/notifications/broadcast?title=${encodeURIComponent(params.title)}&message=${encodeURIComponent(params.message)}&type=${encodeURIComponent(params.type || "SYSTEM")}`,
      { method: "POST" }
    ),

  sendUserNotification: (userId: string, params: { title: string; message: string; type?: string }) =>
    apiClient<void>(
      `/api/v1/admin/notifications/user/${userId}?title=${encodeURIComponent(params.title)}&message=${encodeURIComponent(params.message)}&type=${encodeURIComponent(params.type || "SYSTEM")}`,
      { method: "POST" }
    ),
};
