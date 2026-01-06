# Day.News Mobile App - Backend Integration Plan

## Overview
This document outlines the integration plan for connecting the Day.News React Native mobile app to the Laravel backend platform.

## Backend Architecture Analysis

### Database Schema
- **Table**: `day_news_posts` (not `articles`)
- **Key Fields**:
  - `id` (bigint, primary key)
  - `workspace_id` (uuid, nullable)
  - `author_id` (uuid, nullable)
  - `type`: enum('article', 'announcement', 'notice', 'ad', 'schedule')
  - `category`: enum with values: 'local_news', 'business', 'sports', 'entertainment', 'community', 'education', 'health', 'politics', 'crime', 'weather', 'events', 'obituary', 'missing_person', 'emergency', 'public_notice', 'other'
  - `title`, `slug`, `content`, `excerpt`
  - `featured_image`, `featured_image_path`, `featured_image_disk`
  - `status`: enum('draft', 'published', 'expired', 'removed')
  - `published_at`, `expires_at`
  - `view_count`
  - `metadata` (json)
  - `created_at`, `updated_at`

### Relationships
- `author` → User model
- `writerAgent` → WriterAgent model
- `regions` → Many-to-many with Region model
- `workspace` → Workspace model
- `comments` → ArticleComment model (hasMany)
- `tags` → Tag model (many-to-many)

### Authentication
- Uses Laravel Sanctum for API authentication
- Token-based authentication
- Endpoints: `/api/login`, `/api/register`, `/api/logout`
- User endpoint: `/api/user` (requires auth:sanctum)

### Current Backend Routes (Web)
- Home: `/` (Inertia render)
- Post detail: `/posts/{slug}` (Inertia render)
- Comments: `/posts/{post}/comments` (GET, POST)
- Search: `/search`, `/api/search/suggestions`
- Regions: Region-based filtering

### Missing API Endpoints
The backend currently uses Inertia.js for web, but lacks REST API endpoints for mobile. We need to either:
1. Create new API controllers in Laravel backend
2. Use existing web routes with JSON responses
3. Create a dedicated mobile API

## Mobile App Integration Strategy

### Phase 1: API Client Setup
1. Replace Supabase client with Laravel API client
2. Create base API service with authentication
3. Set up token storage (AsyncStorage)
4. Implement request/response interceptors

### Phase 2: Data Models
1. Update Article interface to match DayNewsPost schema
2. Map category enums correctly
3. Handle region relationships
4. Support author/writer agent display

### Phase 3: Core Features
1. **Posts/Articles**:
   - List published posts
   - Filter by category
   - Filter by region
   - Post detail view
   - View count tracking

2. **Comments**:
   - List comments for a post
   - Create comment
   - Like/unlike comment
   - Reply to comment
   - Report comment

3. **Search**:
   - Search posts
   - Search suggestions
   - Search history

4. **Regions**:
   - Detect user location
   - Set preferred region
   - Filter content by region

### Phase 4: Authentication
1. Login screen
2. Register screen
3. Password reset
4. Token refresh
5. User profile

### Phase 5: Additional Features
1. Announcements
2. Classifieds
3. Coupons
4. Photos/Albums
5. Podcasts (Local Voices)
6. Legal Notices
7. Memorials

## API Endpoints Needed

### Posts
- `GET /api/day-news/posts` - List posts (with filters: category, region, search)
- `GET /api/day-news/posts/{id}` - Get single post
- `GET /api/day-news/posts/{slug}` - Get post by slug
- `POST /api/day-news/posts/{id}/view` - Track view

### Comments
- `GET /api/day-news/posts/{id}/comments` - List comments
- `POST /api/day-news/posts/{id}/comments` - Create comment
- `PATCH /api/day-news/comments/{id}` - Update comment
- `DELETE /api/day-news/comments/{id}` - Delete comment
- `POST /api/day-news/comments/{id}/like` - Toggle like
- `POST /api/day-news/comments/{id}/report` - Report comment

### Search
- `GET /api/search` - Search posts
- `GET /api/search/suggestions` - Get search suggestions

### Regions
- `GET /api/regions` - List regions
- `POST /api/location/detect-browser` - Detect location
- `POST /api/location/set-region` - Set user region

### Authentication
- `POST /api/login` - Login
- `POST /api/register` - Register
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user

## Implementation Steps

1. **Create Laravel API Controllers** (if not exist)
   - `Api/DayNews/PostController`
   - `Api/DayNews/CommentController`
   - `Api/SearchController`
   - `Api/AuthController`

2. **Update Mobile App**
   - Replace Supabase with Laravel API client
   - Update data models
   - Implement authentication
   - Update all stores and components

3. **Testing**
   - Test API endpoints
   - Test authentication flow
   - Test data fetching
   - Test error handling

## Category Mapping

Backend categories → Mobile app categories:
- `local_news` → `news`
- `business` → `business`
- `sports` → `sports`
- `politics` → `government`
- `events` → `events`
- `entertainment`, `community`, `education`, `health`, `crime`, `weather`, `obituary`, `missing_person`, `emergency`, `public_notice`, `other` → `lifestyle` (or create new categories)

## Next Steps
1. Review and approve this plan
2. Create API endpoints in Laravel backend (or confirm existing ones)
3. Implement mobile app changes
4. Test integration
5. Deploy

