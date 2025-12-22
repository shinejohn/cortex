# Phase 3: DayNews & GoEventCity Enhancements - Platform Differentiation Strategy

## Design Philosophy

**Shared Backend, Unique Frontend Experience**

Each platform should feel distinct while leveraging common services:
- **DayNews Business Directory**: "Local Business News & Community Directory"
  - Focus: News articles, community stories, local coverage
  - Unique value: "See what's happening at local businesses"
  - Visual: Newspaper-style, editorial feel, blue theme
  
- **GoEventCity Business Directory**: "Event Venues & Performer Directory"
  - Focus: Events, venues, performers, bookings
  - Unique value: "Find venues and performers for your events"
  - Visual: Modern, event-focused, indigo theme

- **DowntownsGuide Business Directory**: "Complete Business Discovery Platform"
  - Focus: Reviews, deals, loyalty, discovery
  - Unique value: "Discover, review, and save at local businesses"
  - Visual: Discovery-focused, purple theme

## Implementation Strategy

### 1. Refactor Controllers to Use Shared Services
- DayNews BusinessController → BusinessService
- DayNews CouponController → CouponService
- DayNews EventController → EventService
- GoEventCity VenueController → BusinessService (venues are businesses)
- Add organization relationship integration

### 2. Create Platform-Specific Business Directory Pages
- DayNews: News-focused, article integration, community stories
- GoEventCity: Event-focused, venue/performer integration, booking focus
- Each uses shared BusinessService but presents differently

### 3. Platform-Specific Business Components
- DayNewsBusinessCard: Shows recent news articles, community engagement
- EventCityBusinessCard: Shows upcoming events, booking availability
- Use shared BusinessCard as base, extend with platform-specific features

### 4. Organization Relationship Integration
- Show related content (articles, events) on business pages
- Cross-platform content discovery
- Organization hierarchy display

### 5. Theme Variants
- DayNews: Blue theme, editorial styling
- GoEventCity: Indigo theme, modern event styling
- DowntownsGuide: Purple theme, discovery styling

