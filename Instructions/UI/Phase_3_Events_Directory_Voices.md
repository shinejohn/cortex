# PHASE 3: GoEventCity + Downtown Guide + Go Local Voices UI CODE REVIEW
## Antigravity Instructions — Page-by-Page Inspection

---

**Objective:** Review every page and component belonging to GoEventCity, Downtown Guide, and Go Local Voices. These three apps share the Publishing database and similar architectural patterns. Apply ALL 12 standard checks from Phase 2 (including the Inertia-specific checks for props, navigation, forms, Head/SEO, and SSR safety) plus app-specific checks below.

**Prerequisites:** Phase 2 must be complete.

---

## APP 3A: GoEventCity (Events & Calendar)

### Expected Pages
- **Event Listing/Calendar** — Browse events by date, category, region
- **Event Detail** — Full event info with venue, dates, tickets, RSVP
- **Event Category View** — Filtered by category (Music, Food, Sports, etc.)
- **Calendar View** — Monthly/weekly calendar grid
- **Venue Detail** — Venue information, upcoming events at venue
- **Event Search** — Search events by keyword, date range, location
- **Event Creation** (if public) — Submit event form
- **Ticket/RSVP Pages** — Registration, ticket purchase via Stripe

### GoEventCity-Specific Checks
```
□ Event dates display correctly across timezones
□ Recurring events display all instances properly
□ Past events are visually distinguished from upcoming events
□ "Add to Calendar" button generates valid .ics file or links
□ Venue map displays correctly (Google Maps integration)
□ Venue address links to directions
□ Ticket/registration CTA buttons work
□ Stripe integration loads properly for paid events
□ RSVP tracking increments count correctly
□ Event categories filter correctly
□ Date range picker works for filtering
□ Event images display with proper aspect ratios
□ Event sharing URLs resolve correctly
□ Schema.org Event structured data is present for SEO
□ Calendar widget renders all days correctly
□ Calendar navigation (prev/next month) works
□ Events display correctly on calendar day cells
□ Mobile calendar view is usable (not just desktop shrunk)
```

---

## APP 3B: Downtown Guide (Business Directory)

### Expected Pages
- **Business Listing** — Browse businesses by category
- **Business Detail** — Full business profile with info, reviews, deals, hours
- **Business Category View** — Filtered by business type
- **Business Search** — Search by name, category, keyword
- **Reviews/Ratings** — Review list, write a review
- **Deals & Coupons** — Current offers from businesses
- **Job Board** (if applicable) — Local job listings
- **Business Claim** — Business owner claiming their listing

### Downtown Guide-Specific Checks
```
□ Business hours display correctly (open now vs closed)
□ Business phone number is clickable (tel: link) on mobile
□ Business website link opens in new tab
□ Business address links to maps/directions
□ Google Places data integration displays correctly
□ Business photos gallery works (carousel/grid)
□ Star ratings display correctly (half stars, empty stars)
□ Review submission form works for authenticated users
□ Review display shows author, date, rating, text
□ Deals/coupons show expiration dates correctly
□ "Claimed" vs "Unclaimed" business badge displays
□ Business categories filter produces correct results
□ Business search returns relevant results
□ Business profile completeness indicators work
□ Business social media links work (Facebook, Instagram, etc.)
□ "Community's Choice" winner badges display if applicable
□ Schema.org LocalBusiness structured data is present for SEO
□ Business operating hours account for holidays/special hours
```

---

## APP 3C: Go Local Voices (Podcasts/Video Content)

### Expected Pages
- **Content Listing** — Browse podcasts and videos
- **Podcast Detail** — Episode list, player, show description
- **Episode Detail** — Audio/video player, transcript, show notes
- **Video Detail** — Video player, description, related content
- **Channel/Show Listing** — Browse by channel or show
- **Playlist View** — User or curated playlists
- **Media Player** — Persistent audio player (if applicable)

### Go Local Voices-Specific Checks
```
□ Audio player loads and plays audio files
□ Audio player controls work (play, pause, skip, volume, progress bar)
□ Audio player shows episode title and artwork
□ Video player loads and plays video content
□ Video player controls work (play, pause, fullscreen, volume)
□ Episode listing shows correct duration, date, description
□ Podcast show page displays all episodes with pagination
□ Transcript display works if transcripts are available
□ Download episode button works (if feature exists)
□ Playlist creation and management works
□ Media player persists during navigation (if persistent player exists)
□ Embeddable media player renders correctly
□ Audio/video file loading shows proper buffering indicators
□ Failed media load shows appropriate error message
□ Episode sharing URLs resolve correctly
□ RSS feed links generate valid podcast RSS
□ Schema.org PodcastEpisode structured data is present for SEO
□ Media files serve correctly from storage (S3/local)
```

---

## CROSS-APP CHECKS (Apply to ALL three apps)

### Shared Layout Verification
```
□ Header/navigation is consistent across all three apps
□ Footer links work and content is up to date
□ Logo links back to the correct app home page (not another app)
□ Mobile hamburger menu opens and closes
□ Mobile navigation items are all present and working
□ Region/community selector works (changes content appropriately)
□ User auth state displays correctly (logged in vs guest) — uses usePage().props.auth.user
□ Login/logout flow works from each app
□ Logout uses <Link method="post"> (NOT a GET request)
□ Cross-app navigation links work (e.g., "Events" link from Downtown Guide goes to GoEventCity)
□ Cross-app links use <a> tags (different domains) NOT Inertia <Link> (same-domain only)
□ Flash messages from HandleInertiaRequests display correctly across all apps
□ Persistent layout (if used) doesn't re-mount during same-app navigation
```

### Shared Component Verification
```
□ All shared components render identically across the three apps
□ Shared components receive correct props from each app's controllers
□ No shared component has app-specific logic that breaks in other apps
□ Card components (event cards, business cards, media cards) render consistently
□ Pagination component works identically across all list pages
□ Search component works with each app's search endpoint
□ Share button components generate correct URLs per app/domain
```

---

## INSPECTION PROCESS

For each of the three apps, follow this exact sequence:

1. **Open the Phase 1 checklist** and identify all pages assigned to this app
2. **For each page**, run ALL 12 standard checks from Phase 2 (including Inertia-specific: props/data flow, navigation via <Link>, useForm() patterns, <Head> SEO, SSR safety)
3. **Then run the app-specific checks** listed above
4. **Log every finding** in the audit log JSON format
5. **Fix** EVERY issue at ALL severity levels — no exceptions, no backlog
6. **Update** the master checklist status

---

## COMPLETION CRITERIA FOR PHASE 3

Phase 3 is COMPLETE when:

1. ✅ Every GoEventCity page has been inspected with all standard + app-specific checks
2. ✅ Every Downtown Guide page has been inspected with all standard + app-specific checks
3. ✅ Every Go Local Voices page has been inspected with all standard + app-specific checks
4. ✅ Cross-app checks have been completed
5. ✅ Every issue at ALL severity levels (CRITICAL, HIGH, MEDIUM, LOW) has been FIXED and VERIFIED — zero open issues
6. ✅ Master checklist updated for all three apps
7. ✅ All changes committed to `qa/pre-production-phase-3` branch
8. ✅ `QA_AUDIT_LOG_PHASE_3.json` generated and committed

**Do not proceed to Phase 4 until Phase 3 is fully complete.**
