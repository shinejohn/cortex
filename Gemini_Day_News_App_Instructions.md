# Day.News Mobile App - Complete Build Instructions for Gemini 3.0

## 🎯 Project Overview

Build the **Day.News** native mobile app - a hyperlocal news reader that connects to an existing Laravel backend. The app serves AI-generated and community-submitted local news to specific communities across America.

**This is a FRONTEND-ONLY build.** The backend is a Laravel application with PostgreSQL database, using Inertia/SSR for the web frontend. Your job is to build the React Native mobile app that consumes the Laravel REST API.

---

## 🏗️ Backend Architecture (Already Built)

```
Backend Stack (DO NOT BUILD - Already exists):
├── Framework: Laravel 11
├── Database: PostgreSQL (164+ tables)
├── Auth: Laravel Sanctum (Bearer tokens)
├── Web Frontend: Inertia.js with SSR
├── Hosting: AWS ECS Fargate
└── Cache: Redis (ElastiCache)
```

**Your job:** Build the React Native mobile app that consumes the existing REST API.

---

## 📱 Mobile Tech Stack (What You Build)

```
React Native with Expo (SDK 50+)
├── Navigation: React Navigation v6 (tabs + stack)
├── State Management: Zustand + React Query (TanStack Query)
├── Styling: NativeWind (Tailwind for React Native)
├── Icons: Lucide React Native
├── Media: expo-av (audio/video player)
├── HTTP Client: Axios (for Laravel API calls)
├── Auth: Secure token storage with expo-secure-store
├── Storage: @react-native-async-storage/async-storage
├── Images: expo-image (better than Image component)
└── Location: expo-location (for community detection)
```

---

## 🔌 Laravel API Connection

### Base Configuration

```
Production API: https://api.day.news/v1
Staging API: https://api-staging.day.news/v1
```

### Authentication

All API requests require Bearer token authentication:

```
Authorization: Bearer {access_token}
```

Tokens are obtained through `/auth/login` and expire after 24 hours.

### Response Format

All Laravel API responses follow this structure:

```json
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": [...]
  }
}
```

### HTTP Status Codes

- 200 OK — Successful request
- 201 Created — Resource created
- 204 No Content — Successful deletion
- 400 Bad Request — Invalid request data
- 401 Unauthorized — Authentication required
- 403 Forbidden — Insufficient permissions
- 404 Not Found — Resource not found
- 422 Unprocessable Entity — Validation error
- 429 Too Many Requests — Rate limit exceeded

### Rate Limits

- Unauthenticated: 60 requests/minute
- Authenticated: 120 requests/minute
- Premium: 300 requests/minute

---

## 🔐 API Client Setup

### Create API Client (lib/api.ts)

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.day.news/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - clear and redirect to login
      await SecureStore.deleteItemAsync('access_token');
      // Trigger logout in auth store
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔑 Authentication Endpoints

### Auth API Service (lib/authApi.ts)

```typescript
import api from './api';
import * as SecureStore from 'expo-secure-store';

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    access_token: string;
    expires_at: string;
  };
}

interface User {
  id: string;
  fullname: string;
  email: string;
  profile_picture?: string;
  favorite_city_id?: string;
  role: string;
}

// Login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, password });
  
  if (response.data.success) {
    // Store token securely
    await SecureStore.setItemAsync('access_token', response.data.data.access_token);
  }
  
  return response.data;
};

// Register
export const register = async (data: {
  fullname: string;
  email: string;
  password: string;
  password_confirmation: string;
  favorite_city_id: string;
}): Promise<LoginResponse> => {
  const response = await api.post('/users', data);
  
  if (response.data.success && response.data.data.access_token) {
    await SecureStore.setItemAsync('access_token', response.data.data.access_token);
  }
  
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    await SecureStore.deleteItemAsync('access_token');
  }
};

// Logout from all devices
export const logoutAll = async (): Promise<void> => {
  try {
    await api.post('/auth/logout-all');
  } finally {
    await SecureStore.deleteItemAsync('access_token');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data.data;
};

// Request password reset
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

// Reset password with token
export const resetPassword = async (data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> => {
  await api.post('/auth/reset-password', data);
};

// Social login (Google/Apple)
export const socialLogin = async (provider: 'google' | 'apple', token: string): Promise<LoginResponse> => {
  const response = await api.post(`/auth/social/${provider}`, { token });
  
  if (response.data.success) {
    await SecureStore.setItemAsync('access_token', response.data.data.access_token);
  }
  
  return response.data;
};

// Request magic link
export const requestMagicLink = async (email: string): Promise<void> => {
  await api.post('/auth/magic-link', { email });
};

// Get active sessions
export const getSessions = async () => {
  const response = await api.get('/auth/sessions');
  return response.data.data;
};

// Revoke specific session
export const revokeSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/auth/sessions/${sessionId}`);
};
```

---

## 📰 Content API Endpoints

### News API (lib/newsApi.ts)

```typescript
import api from './api';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  slug: string;
  publication_date: string;
  category: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  image?: string;
  image_description?: string;
  tags: string[];
  priority_score: number;
  likes: string[];
  saved: string[];
  shared: string[];
  author?: VirtualJournalist;
  city?: City;
  created_at: string;
  updated_at: string;
}

interface VirtualJournalist {
  id: string;
  fullname: string;
  bio?: string;
  avatar?: string;
  specialism: string[];
}

interface City {
  id: string;
  geo_sw_placename: string;  // City name
  geo_sw_adminname1: string; // State
  geo_sw_postalcode: string;
  geo_sw_lat: number;
  geo_sw_lng: number;
}

// Get news feed for a city
export const getNews = async (
  cityId: string,
  page = 1,
  perPage = 20,
  category?: string
): Promise<PaginatedResponse<Article>> => {
  const params: Record<string, any> = {
    city_id: cityId,
    status: 'published',
    page,
    per_page: perPage,
    sort: 'publication_date',
    order: 'desc',
  };
  
  if (category && category !== 'all') {
    params.category = category;
  }
  
  const response = await api.get('/posts', { params });
  return response.data;
};

// Get featured/hero story
export const getFeaturedStory = async (cityId: string): Promise<Article | null> => {
  const response = await api.get('/posts', {
    params: {
      city_id: cityId,
      status: 'published',
      sort: 'priority_score',
      order: 'desc',
      per_page: 1,
    },
  });
  return response.data.data[0] || null;
};

// Get single article by slug
export const getArticle = async (slug: string): Promise<Article> => {
  const response = await api.get(`/posts/${slug}`);
  return response.data.data;
};

// Get related articles
export const getRelatedArticles = async (
  articleId: string,
  cityId: string,
  limit = 5
): Promise<Article[]> => {
  const response = await api.get('/posts', {
    params: {
      city_id: cityId,
      status: 'published',
      exclude_id: articleId,
      per_page: limit,
    },
  });
  return response.data.data;
};

// Search articles
export const searchArticles = async (
  query: string,
  cityId?: string
): Promise<Article[]> => {
  const params: Record<string, any> = {
    q: query,
    status: 'published',
  };
  
  if (cityId) {
    params.city_id = cityId;
  }
  
  const response = await api.get('/posts/search', { params });
  return response.data.data;
};

// Get user's saved articles
export const getSavedArticles = async (userId: string): Promise<Article[]> => {
  const response = await api.get(`/users/${userId}/saved-posts`);
  return response.data.data;
};
```

### Interactions API (lib/interactionsApi.ts)

```typescript
import api from './api';

// Like/react to article
export const likeArticle = async (articleId: string): Promise<void> => {
  await api.post(`/posts/${articleId}/like`);
};

// Unlike article
export const unlikeArticle = async (articleId: string): Promise<void> => {
  await api.delete(`/posts/${articleId}/like`);
};

// Save article
export const saveArticle = async (articleId: string): Promise<void> => {
  await api.post(`/posts/${articleId}/save`);
};

// Unsave article
export const unsaveArticle = async (articleId: string): Promise<void> => {
  await api.delete(`/posts/${articleId}/save`);
};

// Share article (track share)
export const shareArticle = async (articleId: string): Promise<void> => {
  await api.post(`/posts/${articleId}/share`);
};

// React with emoji
export const reactToArticle = async (
  articleId: string,
  reaction: 'like' | 'love' | 'wow'
): Promise<void> => {
  await api.post(`/posts/${articleId}/react`, { reaction });
};
```

### Comments API (lib/commentsApi.ts)

```typescript
import api from './api';

interface Comment {
  id: string;
  content: string;
  parent_id: string;
  parent_type: 'news' | 'announcement' | 'listing';
  created_by: string;
  user?: {
    id: string;
    fullname: string;
    profile_picture?: string;
  };
  likes: number;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

// Get comments for an article
export const getComments = async (
  articleId: string,
  page = 1,
  perPage = 20
): Promise<{ data: Comment[]; meta: any }> => {
  const response = await api.get(`/posts/${articleId}/comments`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};

// Add comment
export const addComment = async (
  articleId: string,
  content: string,
  parentCommentId?: string
): Promise<Comment> => {
  const response = await api.post(`/posts/${articleId}/comments`, {
    content,
    parent_comment_id: parentCommentId,
  });
  return response.data.data;
};

// Delete comment
export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete(`/comments/${commentId}`);
};

// Like comment
export const likeComment = async (commentId: string): Promise<void> => {
  await api.post(`/comments/${commentId}/like`);
};

// Report comment
export const reportComment = async (
  commentId: string,
  reason: string
): Promise<void> => {
  await api.post(`/comments/${commentId}/report`, { reason });
};
```

---

## 📅 Events API

### Events API (lib/eventsApi.ts)

```typescript
import api from './api';

interface Event {
  id: string;
  announcement_type: string;
  event_type: string;
  short_description: string;
  full_description?: string;
  main_image?: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  date_time_start: string;
  date_time_end?: string;
  link?: string;
  tags: string[];
  likes: string[];
  created_at: string;
}

// Get upcoming events
export const getEvents = async (
  cityId: string,
  page = 1,
  perPage = 20,
  eventType?: string
): Promise<{ data: Event[]; meta: any }> => {
  const params: Record<string, any> = {
    city_id: cityId,
    start_date: new Date().toISOString(),
    page,
    per_page: perPage,
    sort: 'date_time_start',
    order: 'asc',
  };
  
  if (eventType) {
    params.event_type = eventType;
  }
  
  const response = await api.get('/events', { params });
  return response.data;
};

// Get single event
export const getEvent = async (eventId: string): Promise<Event> => {
  const response = await api.get(`/events/${eventId}`);
  return response.data.data;
};

// Get events for date range (calendar view)
export const getEventsInRange = async (
  cityId: string,
  startDate: string,
  endDate: string
): Promise<Event[]> => {
  const response = await api.get('/events', {
    params: {
      city_id: cityId,
      start_date: startDate,
      end_date: endDate,
    },
  });
  return response.data.data;
};

// RSVP to event
export const rsvpToEvent = async (eventId: string): Promise<void> => {
  await api.post(`/events/${eventId}/rsvp`);
};

// Cancel RSVP
export const cancelRsvp = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}/rsvp`);
};
```

---

## 🏢 Business Directory API

### Business API (lib/businessApi.ts)

```typescript
import api from './api';

interface Business {
  id: string;
  name: string;
  type: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  city_id: string;
  priority_score: number;
  created_at: string;
}

// Get businesses
export const getBusinesses = async (
  cityId: string,
  page = 1,
  perPage = 20,
  type?: string
): Promise<{ data: Business[]; meta: any }> => {
  const params: Record<string, any> = {
    city_id: cityId,
    page,
    per_page: perPage,
  };
  
  if (type) {
    params.type = type;
  }
  
  const response = await api.get('/businesses', { params });
  return response.data;
};

// Get single business
export const getBusiness = async (businessId: string): Promise<Business> => {
  const response = await api.get(`/businesses/${businessId}`);
  return response.data.data;
};

// Search businesses
export const searchBusinesses = async (
  query: string,
  cityId: string
): Promise<Business[]> => {
  const response = await api.get('/businesses/search', {
    params: { q: query, city_id: cityId },
  });
  return response.data.data;
};

// Get business categories
export const getBusinessCategories = async (): Promise<string[]> => {
  const response = await api.get('/businesses/categories');
  return response.data.data;
};
```

---

## 🎙️ Multimedia API

### Multimedia API (lib/multimediaApi.ts)

```typescript
import api from './api';

interface MultimediaContent {
  id: string;
  content_type: 'podcast' | 'video';
  title: string;
  description?: string;
  media_url: string;
  thumbnail?: string;
  duration?: number;
  city_id: string;
  status: 'draft' | 'published';
  episode_number?: number;
  show_id?: string;
  chapters?: Chapter[];
  created_at: string;
}

interface Chapter {
  title: string;
  start_time: number;
}

interface Show {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  episode_count: number;
}

// Get podcasts
export const getPodcasts = async (
  cityId: string,
  page = 1
): Promise<{ data: MultimediaContent[]; meta: any }> => {
  const response = await api.get('/multimedia', {
    params: {
      city_id: cityId,
      content_type: 'podcast',
      status: 'published',
      page,
      sort: 'created_at',
      order: 'desc',
    },
  });
  return response.data;
};

// Get videos
export const getVideos = async (
  cityId: string,
  page = 1
): Promise<{ data: MultimediaContent[]; meta: any }> => {
  const response = await api.get('/multimedia', {
    params: {
      city_id: cityId,
      content_type: 'video',
      status: 'published',
      page,
      sort: 'created_at',
      order: 'desc',
    },
  });
  return response.data;
};

// Get single episode
export const getEpisode = async (episodeId: string): Promise<MultimediaContent> => {
  const response = await api.get(`/multimedia/${episodeId}`);
  return response.data.data;
};

// Get shows list
export const getShows = async (cityId: string): Promise<Show[]> => {
  const response = await api.get('/shows', {
    params: { city_id: cityId },
  });
  return response.data.data;
};

// Get episodes for a show
export const getShowEpisodes = async (showId: string): Promise<MultimediaContent[]> => {
  const response = await api.get(`/shows/${showId}/episodes`);
  return response.data.data;
};
```

---

## 🌍 Cities/Communities API

### Cities API (lib/citiesApi.ts)

```typescript
import api from './api';

interface City {
  id: string;
  geo_sw_placename: string;  // City name (e.g., "Clearwater")
  geo_sw_adminname1: string; // State (e.g., "Florida")
  geo_sw_iso3166_2: string;  // State code (e.g., "FL")
  geo_sw_lat: number;
  geo_sw_lng: number;
  geo_sw_postalcode: string;
  geo_se_population?: number;
  openai_description?: string;
  google_pl_photos?: string[];
}

// Search cities
export const searchCities = async (query: string): Promise<City[]> => {
  const response = await api.get('/cities/search', {
    params: { q: query },
  });
  return response.data.data;
};

// Get city by ID
export const getCity = async (cityId: string): Promise<City> => {
  const response = await api.get(`/cities/${cityId}`);
  return response.data.data;
};

// Get city by coordinates
export const getCityByLocation = async (
  lat: number,
  lng: number
): Promise<City | null> => {
  const response = await api.get('/cities/nearby', {
    params: { lat, lng },
  });
  return response.data.data;
};

// Get popular/featured cities
export const getFeaturedCities = async (): Promise<City[]> => {
  const response = await api.get('/cities/featured');
  return response.data.data;
};
```

---

## 👤 User Profile API

### Profile API (lib/profileApi.ts)

```typescript
import api from './api';

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  banner_image?: string;
  location?: any;
  favorite_city_id?: string;
  favorite_city?: City;
  role: string;
  created_at: string;
}

// Get user profile
export const getProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
};

// Update profile
export const updateProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data.data;
};

// Upload profile picture
export const uploadProfilePicture = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('profile_picture', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  } as any);
  
  const response = await api.post(`/users/${userId}/profile-picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data.data.profile_picture;
};

// Get user activity
export const getUserActivity = async (userId: string): Promise<any[]> => {
  const response = await api.get(`/users/${userId}/activity`);
  return response.data.data;
};

// Get user's posts/articles
export const getUserPosts = async (userId: string): Promise<any[]> => {
  const response = await api.get(`/users/${userId}/posts`);
  return response.data.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (
  preferences: Record<string, boolean>
): Promise<void> => {
  await api.put('/notification-preferences', preferences);
};

// Register push token
export const registerPushToken = async (token: string): Promise<void> => {
  await api.post('/push-tokens', { token });
};
```

---

## 🗂️ Navigation Architecture

### Bottom Tab Navigator (5 tabs)

```
TabNavigator (Bottom Tabs)
├── HomeStack
│   ├── Home (Feed) - index.tsx
│   └── ArticleDetail - article/[slug].tsx
├── NewsStack
│   ├── Categories - news.tsx
│   └── ArticleDetail - article/[slug].tsx
├── EventsStack
│   ├── EventsList - events.tsx
│   └── EventDetail - event/[id].tsx
├── BusinessStack
│   ├── BusinessDirectory - business.tsx
│   └── BusinessDetail - business/[id].tsx
└── MenuStack
    ├── Menu - menu.tsx
    ├── LocalVoices - local-voices.tsx
    ├── Player - player/[id].tsx
    ├── Profile - profile.tsx
    ├── Settings - settings.tsx
    └── Search - search.tsx
```

### Auth Stack (unauthenticated users)

```
AuthStack
├── Onboarding - onboarding.tsx
├── Login - login.tsx
├── Signup - signup.tsx
└── ForgotPassword - forgot-password.tsx
```

---

## 📱 Screen Specifications

### 1. HOME SCREEN (Main Feed)

**Purpose:** Primary content discovery - mixed feed of news, events, and ads

**Components Required:**
- `CommunityHeader` - City name + weather + current date
- `HeroStoryCard` - Large featured article with image
- `StoryCardSmall` - Horizontal scrolling story cards
- `NativeAdBanner` - Sponsored content (styled to match content)
- `EventCardSmall` - Horizontal scrolling event previews
- `StoryListItem` - Vertical list of latest news with thumbnails

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ 📍 Clearwater, FL  •  78°F ☀️      │ ← Community Header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [HERO IMAGE - 16:9 ratio]       │ │ ← Featured Story
│ │ BREAKING                        │ │
│ │ Downtown Plan Approved          │ │
│ │ 5 min read • Local Govt         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ TODAY'S TOP STORIES                 │
│ ┌───────┐ ┌───────┐ ┌───────┐      │ ← Horizontal FlatList
│ │Card 1 │ │Card 2 │ │Card 3 │      │
│ └───────┘ └───────┘ └───────┘      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ SPONSORED: Local Business Ad    │ │ ← Native Ad
│ └─────────────────────────────────┘ │
│                                     │
│ UPCOMING EVENTS                     │
│ ┌───────┐ ┌───────┐ ┌───────┐      │ ← Horizontal FlatList
│ │Event 1│ │Event 2│ │Event 3│      │
│ └───────┘ └───────┘ └───────┘      │
│                                     │
│ LATEST NEWS                         │
│ ┌─────────────────────────────────┐ │
│ │ [Thumb] Story Title             │ │ ← Vertical FlatList
│ │         Category • 2h ago       │ │    with infinite scroll
│ └─────────────────────────────────┘ │
│ [Infinite scroll continues...]      │
└─────────────────────────────────────┘
     🏠      📰      📅      💼      ☰
    Home    News   Events  Business Menu
```

**API Calls:**
```typescript
// On mount
const featured = await getFeaturedStory(cityId);
const topStories = await getNews(cityId, 1, 10);
const events = await getEvents(cityId, 1, 5);
const latestNews = await getNews(cityId, 1, 20);
```

---

### 2. ARTICLE DETAIL SCREEN

**Purpose:** Full article reading experience with engagement features

**Components Required:**
- `ArticleHeader` - Category badge, headline, subtitle, author, date
- `ArticleImage` - Hero image with caption
- `ArticleBody` - Rich text content with drop cap styling
- `PullQuote` - Styled blockquote component
- `ReactionBar` - 👍 ❤️ 😮 emoji reactions with counts
- `CommentSection` - Comment input + threaded comment list
- `RelatedStories` - Horizontal cards of related content

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ←                    ↗️  🔖  ⋮     │ ← Header: Back, Share, Save, More
├─────────────────────────────────────┤
│                                     │
│ LOCAL GOVERNMENT                    │ ← Category badge (colored)
│                                     │
│ Downtown Plan Gets                  │ ← Headline (serif, large)
│ Green Light From                    │
│ City Council                        │
│                                     │
│ Brief subheadline here             │ ← Subtitle (muted)
│                                     │
│ By Sarah Johnson                    │ ← Author name
│ Dec 3, 2024 • 5 min read           │ ← Date & read time
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      [ARTICLE IMAGE]            │ │ ← Hero image
│ └─────────────────────────────────┘ │
│ Photo credit: Photographer Name     │ ← Caption
│                                     │
│ T  he Clearwater City              │ ← Drop cap first letter
│    Council voted unanimously       │
│ Tuesday evening to approve         │
│ the long-awaited downtown...       │
│                                     │
│ [Article body continues...]        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ "This is historic for us"       │ │ ← Pull quote
│ │         — Mayor Johnson         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Tags: #downtown #development       │
│                                     │
├─────────────────────────────────────┤
│ 👍 127  ❤️ 45  😮 23              │ ← Reactions (tappable)
├─────────────────────────────────────┤
│ 💬 COMMENTS (47)                   │
│                                     │
│ [Add a comment...]                 │ ← Comment input
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 John Smith • 2h ago          │ │ ← Comment card
│ │ Great news for downtown!        │ │
│ │ 👍 12  Reply                    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ MORE FROM CLEARWATER               │
│ ┌───────┐ ┌───────┐ ┌───────┐     │ ← Related stories
│ │Story 1│ │Story 2│ │Story 3│     │
│ └───────┘ └───────┘ └───────┘     │
└─────────────────────────────────────┘
```

**API Calls:**
```typescript
// On mount
const article = await getArticle(slug);
const comments = await getComments(article.id);
const related = await getRelatedArticles(article.id, article.city_id);

// User actions
await likeArticle(article.id);
await saveArticle(article.id);
await addComment(article.id, commentText);
```

---

### 3-8. Additional Screens

*(News Categories, Events, Business Directory, Local Voices, Media Player, Auth Screens - same layouts as original spec)*

---

## 🎨 Design System

### Color Palette

```typescript
const colors = {
  // Primary
  primary: '#0F172A',       // Dark navy - headers, primary text
  accent: '#059669',        // Emerald green - buttons, CTAs
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Status
  success: '#059669',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',
  
  // Category Colors
  categoryNews: '#2563EB',
  categorySports: '#059669',
  categoryBusiness: '#7C3AED',
  categoryGovernment: '#DC2626',
  categoryLifestyle: '#EC4899',
  categoryEvents: '#F59E0B',
  categoryCrime: '#64748B',
  categoryHealth: '#14B8A6',
};
```

### Typography

```typescript
const fonts = {
  // Headlines & Article Text (serif)
  headline: 'PlayfairDisplay-Bold',
  headlineMedium: 'PlayfairDisplay-Medium',
  body: 'Lora-Regular',
  bodyItalic: 'Lora-Italic',
  
  // UI Elements (sans-serif)
  ui: 'Inter-Regular',
  uiMedium: 'Inter-Medium',
  uiBold: 'Inter-SemiBold',
};
```

---

## 📁 Project File Structure

```
/src
├── /app (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx           # Home feed
│   │   ├── news.tsx            # News categories
│   │   ├── events.tsx          # Events list
│   │   ├── business.tsx        # Business directory
│   │   └── menu.tsx            # Menu/more
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── onboarding.tsx
│   ├── article/[slug].tsx
│   ├── event/[id].tsx
│   ├── business/[id].tsx
│   ├── local-voices.tsx
│   ├── player/[id].tsx
│   ├── profile.tsx
│   ├── settings.tsx
│   ├── search.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
│
├── /components
│   ├── /ui (Button, Card, Input, Badge, Avatar, Skeleton, Toast)
│   ├── /news (HeroStoryCard, StoryCard, ArticleBody, CommentSection, etc.)
│   ├── /events (EventCard, EventCalendar)
│   ├── /business (BusinessCard, CategoryGrid)
│   ├── /media (AudioPlayer, VideoPlayer, MiniPlayer)
│   └── /layout (Header, TabBar, CommunityHeader)
│
├── /lib
│   ├── api.ts              # Axios instance with interceptors
│   ├── authApi.ts          # Auth endpoints
│   ├── newsApi.ts          # News endpoints
│   ├── eventsApi.ts        # Events endpoints
│   ├── businessApi.ts      # Business endpoints
│   ├── multimediaApi.ts    # Podcasts/videos
│   ├── citiesApi.ts        # Cities/communities
│   ├── profileApi.ts       # User profile
│   ├── commentsApi.ts      # Comments
│   ├── interactionsApi.ts  # Likes, saves, shares
│   └── utils.ts            # Utility functions
│
├── /store
│   ├── authStore.ts        # Auth state (Zustand)
│   ├── cityStore.ts        # Selected city
│   └── settingsStore.ts    # User preferences
│
├── /hooks
│   ├── useAuth.ts
│   ├── useNews.ts
│   ├── useEvents.ts
│   ├── useCity.ts
│   └── usePlayer.ts
│
├── /types
│   ├── api.ts              # API response types
│   ├── news.ts
│   ├── events.ts
│   ├── business.ts
│   └── user.ts
│
└── /constants
    ├── colors.ts
    ├── fonts.ts
    └── config.ts
```

---

## ✅ Build Phases & Checklist

### Phase 1: Foundation (Days 1-3)
- [ ] Initialize Expo project with TypeScript
- [ ] Set up Axios API client with interceptors
- [ ] Implement secure token storage (expo-secure-store)
- [ ] Create Zustand auth store
- [ ] Build authentication flow (login, signup, logout)
- [ ] Create onboarding with city selection

### Phase 2: Core Screens (Days 4-7)
- [ ] Build Home screen with all sections
- [ ] Implement Article detail screen
- [ ] Create News categories with filtering
- [ ] Build Events screen
- [ ] Create Business directory
- [ ] Implement navigation between screens

### Phase 3: Components & Styling (Days 8-10)
- [ ] Style all card components
- [ ] Implement newspaper typography
- [ ] Create reaction and comment components
- [ ] Build search functionality
- [ ] Add category filtering and sorting
- [ ] Implement infinite scroll pagination

### Phase 4: Features (Days 11-14)
- [ ] Build Local Voices screen
- [ ] Create media player
- [ ] Implement save/bookmark
- [ ] Add user profile screen
- [ ] Create settings screen
- [ ] Set up push notifications

### Phase 5: Polish (Days 15-17)
- [ ] Add loading states and skeletons
- [ ] Implement error handling
- [ ] Add pull-to-refresh
- [ ] Implement offline caching
- [ ] Add dark mode support
- [ ] Performance optimization

### Phase 6: Testing & Launch (Days 18-20)
- [ ] Test on iOS and Android
- [ ] Fix platform-specific issues
- [ ] Configure app icons and splash
- [ ] Prepare for app store submission

---

## 🚀 Getting Started Commands

```bash
# Create new Expo project
npx create-expo-app day-news-app --template expo-template-blank-typescript

# Install dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install axios expo-secure-store @react-native-async-storage/async-storage
npm install zustand @tanstack/react-query
npm install nativewind tailwindcss
npm install lucide-react-native
npm install expo-av expo-image expo-location expo-linking
npm install react-native-safe-area-context react-native-screens

# Install fonts
npx expo install expo-font @expo-google-fonts/playfair-display @expo-google-fonts/lora @expo-google-fonts/inter

# Start development
npx expo start
```

---

## ⚠️ Important Notes

1. **Backend is Laravel** - Use Axios with Bearer token auth, NOT Supabase client
2. **All responses are wrapped** - Always access `response.data.data` for the actual data
3. **Handle pagination** - Check `response.data.meta` for pagination info
4. **Token expiry** - Tokens expire in 24 hours, handle 401 responses
5. **Rate limits** - Respect rate limits (60/min unauthenticated, 120/min authenticated)
6. **Error handling** - Check `response.data.success` before processing

---

## 📋 API Endpoint Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/auth/login` |
| Register | POST | `/users` |
| Logout | POST | `/auth/logout` |
| Current User | GET | `/users/me` |
| Get News | GET | `/posts` |
| Get Article | GET | `/posts/{slug}` |
| Like Article | POST | `/posts/{id}/like` |
| Save Article | POST | `/posts/{id}/save` |
| Get Comments | GET | `/posts/{id}/comments` |
| Add Comment | POST | `/posts/{id}/comments` |
| Get Events | GET | `/events` |
| Get Event | GET | `/events/{id}` |
| Get Businesses | GET | `/businesses` |
| Search | GET | `/posts/search` |
| Get Podcasts | GET | `/multimedia?content_type=podcast` |
| Get Videos | GET | `/multimedia?content_type=video` |
| Search Cities | GET | `/cities/search` |
| Update Profile | PUT | `/users/{id}` |

---

This specification provides everything needed to build the Day.News mobile app connecting to the Laravel backend!
