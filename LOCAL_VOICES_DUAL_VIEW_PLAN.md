# Local Voices Dual-View System Plan

## Overview

This plan implements **two frontend views** of Local Voices:
1. **Integrated View** - Current Day.News integration (`day.news/local-voices`)
2. **Standalone View** - New independent platform (`localvoices.com` or subdomain)

Both views:
- ✅ Share the same backend APIs
- ✅ Use the same database
- ✅ Have the same functionality
- ✅ Have different look/feel/branding
- ✅ Can be accessed independently

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Backend (Shared)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Controllers │  │   Services   │  │    Models    │ │
│  │  (Shared)    │  │   (Shared)   │  │   (Shared)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
           │                        │
           │                        │
    ┌──────▼──────┐          ┌──────▼──────┐
    │  Day.News   │          │  Standalone │
    │  Frontend   │          │   Frontend   │
    │             │          │              │
    │ /local-     │          │  localvoices │
    │  voices/    │          │  .com        │
    └─────────────┘          └──────────────┘
```

---

## 1. Backend Strategy

### 1.1 Controller Approach

**Option A: Single Controller with View Detection** ⭐ **Recommended**

Controllers detect which frontend to render based on domain/route:

```php
// app/Http/Controllers/DayNews/CreatorController.php
public function index(Request $request): Response
{
    // ... shared logic ...
    
    $viewPath = $this->getViewPath($request);
    
    return Inertia::render($viewPath, [
        'podcasts' => $podcasts,
        'filters' => $filters,
        'viewMode' => $this->getViewMode($request), // 'integrated' or 'standalone'
    ]);
}

private function getViewPath(Request $request): string
{
    // Check if standalone domain
    if ($request->getHost() === config('domains.local-voices')) {
        return 'local-voices/index';
    }
    
    // Default to Day.News integration
    return 'day-news/local-voices/index';
}

private function getViewMode(Request $request): string
{
    return $request->getHost() === config('domains.local-voices') 
        ? 'standalone' 
        : 'integrated';
}
```

**Option B: Separate Controllers (More Explicit)**

Create `LocalVoices\CreatorController` that uses same services:

```php
// app/Http/Controllers/LocalVoices/CreatorController.php
namespace App\Http\Controllers\LocalVoices;

use App\Http\Controllers\Controller;
use App\Services\DayNews\PodcastService; // Shared service

class CreatorController extends Controller
{
    public function __construct(
        private readonly PodcastService $podcastService
    ) {}
    
    public function index(Request $request): Response
    {
        // Same logic as DayNews\CreatorController
        // But renders 'local-voices/index' instead
    }
}
```

**Recommendation:** Option A (single controller with view detection) - less code duplication, easier maintenance.

### 1.2 Route Configuration

**File:** `routes/local-voices.php` (new)

```php
<?php

use App\Http\Controllers\DayNews\CreatorController;
use App\Http\Controllers\DayNews\PodcastController;
use Illuminate\Support\Facades\Route;

// Standalone Local Voices routes
Route::get('/', [CreatorController::class, 'index'])
    ->name('local-voices.index');

Route::get('/podcasts/{podcast:slug}', [PodcastController::class, 'show'])
    ->name('local-voices.podcast.show');

Route::get('/podcasts/{podcast:slug}/episodes/{episode:slug}', 
    [PodcastController::class, 'showEpisode'])
    ->name('local-voices.episode.show');

Route::middleware(['auth'])->group(function () {
    Route::get('/register', [CreatorController::class, 'create'])
        ->name('local-voices.register');
    Route::post('/register', [CreatorController::class, 'store'])
        ->name('local-voices.register.store');
    Route::get('/dashboard', [CreatorController::class, 'dashboard'])
        ->name('local-voices.dashboard');
    
    // ... other authenticated routes
});
```

**File:** `bootstrap/app.php` (update)

```php
// Add Local Voices domain routing
Route::domain(config('domains.local-voices'))
    ->middleware('web')
    ->name('localvoices.')
    ->group(function () {
        require base_path('routes/auth.php');
        require base_path('routes/settings.php');
        require base_path('routes/local-voices.php');
    });

// Day.News domain (existing)
Route::domain(config('domains.day-news'))
    ->middleware('web')
    ->name('daynews.')
    ->group(function () {
        require base_path('routes/auth.php');
        require base_path('routes/settings.php');
        require base_path('routes/workspace.php');
        require base_path('routes/day-news.php'); // Still has /local-voices routes
    });
```

**File:** `config/domains.php` (update)

```php
return [
    'day-news' => env('DAY_NEWS_DOMAIN', 'day.news'),
    'local-voices' => env('LOCAL_VOICES_DOMAIN', 'localvoices.com'),
    // ... other domains
];
```

---

## 2. Frontend Structure

### 2.1 Directory Structure

```
resources/js/
├── pages/
│   ├── day-news/
│   │   └── local-voices/          # Integrated view (existing)
│   │       ├── index.tsx
│   │       ├── podcast-show.tsx
│   │       ├── episode-show.tsx
│   │       ├── register.tsx
│   │       ├── dashboard.tsx
│   │       ├── podcast-create.tsx
│   │       └── episode-create.tsx
│   │
│   └── local-voices/               # Standalone view (new)
│       ├── index.tsx
│       ├── podcast-show.tsx
│       ├── episode-show.tsx
│       ├── register.tsx
│       ├── dashboard.tsx
│       ├── podcast-create.tsx
│       └── episode-create.tsx
│
├── components/
│   ├── day-news/
│   │   └── day-news-header.tsx    # Existing
│   │
│   └── local-voices/               # New standalone components
│       ├── local-voices-header.tsx
│       ├── local-voices-footer.tsx
│       └── podcast-card.tsx
│
└── layouts/
    ├── day-news-layout.tsx         # Existing (if exists)
    └── local-voices-layout.tsx     # New standalone layout
```

### 2.2 Shared Components

Create shared components that both views can use:

```
resources/js/
└── components/
    └── shared/
        └── podcasts/
            ├── podcast-list.tsx        # Shared list component
            ├── podcast-player.tsx      # Shared audio player
            ├── episode-card.tsx        # Shared episode card
            └── creator-profile.tsx     # Shared creator profile
```

---

## 3. Implementation Plan

### Phase 1: Backend Updates (2-3 hours)

#### Step 1.1: Update Controllers for Dual Views
**Files:** `app/Http/Controllers/DayNews/CreatorController.php`, `PodcastController.php`

**Changes:**
- Add `getViewPath()` method to detect which frontend to render
- Add `getViewMode()` method to pass view mode to frontend
- Update all `Inertia::render()` calls

**Example:**
```php
protected function getViewPath(Request $request, string $page): string
{
    $isStandalone = $request->getHost() === config('domains.local-voices');
    $basePath = $isStandalone ? 'local-voices' : 'day-news/local-voices';
    return "{$basePath}/{$page}";
}

public function index(Request $request): Response
{
    // ... existing logic ...
    
    return Inertia::render(
        $this->getViewPath($request, 'index'),
        [
            'podcasts' => $podcasts,
            'filters' => $filters,
            'viewMode' => $this->getViewMode($request),
        ]
    );
}
```

**Estimated Time:** 1-2 hours

#### Step 1.2: Create Standalone Routes
**File:** `routes/local-voices.php` (new)

**Content:** Copy routes from `routes/day-news.php` Local Voices section, update route names

**Estimated Time:** 30 minutes

#### Step 1.3: Configure Domain Routing
**File:** `bootstrap/app.php`

**Changes:** Add Local Voices domain routing

**File:** `config/domains.php`

**Changes:** Add Local Voices domain configuration

**Estimated Time:** 30 minutes - 1 hour

### Phase 2: Standalone Frontend (6-8 hours)

#### Step 2.1: Create Standalone Header Component
**File:** `resources/js/components/local-voices/local-voices-header.tsx`

**Features:**
- Local Voices branding/logo
- Navigation: Browse, Create, Dashboard
- User menu
- Link to Day.News (optional)
- Search bar

**Estimated Time:** 1-2 hours

#### Step 2.2: Create Standalone Layout
**File:** `resources/js/layouts/local-voices-layout.tsx`

**Features:**
- Wrap pages with Local Voices header
- Apply Local Voices theme
- Footer component
- Remove LocationProvider (or make optional)

**Estimated Time:** 1 hour

#### Step 2.3: Create Standalone Pages
**Files:** Copy all pages from `day-news/local-voices/` to `local-voices/`

**Pages to Create:**
- `index.tsx` - Podcast listing
- `podcast-show.tsx` - Single podcast
- `episode-show.tsx` - Single episode
- `register.tsx` - Creator registration
- `dashboard.tsx` - Creator dashboard
- `podcast-create.tsx` - Create podcast
- `episode-create.tsx` - Upload episode

**Updates Required:**
- Replace `DayNewsHeader` with `LocalVoicesHeader`
- Use `LocalVoicesLayout` instead of `LocationProvider`
- Update styling for Local Voices brand
- Remove Day.News-specific elements

**Estimated Time:** 3-4 hours

#### Step 2.4: Create Shared Components (Optional)
**Files:** `resources/js/components/shared/podcasts/*`

**Components:**
- `podcast-list.tsx` - Reusable podcast listing
- `podcast-player.tsx` - Audio player component
- `episode-card.tsx` - Episode display card
- `creator-profile.tsx` - Creator profile display

**Estimated Time:** 1-2 hours

### Phase 3: Branding & Styling (2-3 hours)

#### Step 3.1: Create Local Voices Brand Assets
- Logo design
- Color palette
- Typography
- Favicon
- Theme configuration

**Estimated Time:** 1-2 hours

#### Step 3.2: Apply Branding to Standalone View
- Update header with logo
- Apply color scheme
- Update favicon
- Create theme CSS variables

**Estimated Time:** 1 hour

### Phase 4: Integration & Testing (2-3 hours)

#### Step 4.1: Ensure Day.News Integration Still Works
- Test all Day.News Local Voices pages
- Verify navigation
- Check styling

**Estimated Time:** 1 hour

#### Step 4.2: Test Standalone View
- Test all standalone pages
- Verify domain routing
- Check authentication flow
- Test cross-platform navigation

**Estimated Time:** 1 hour

#### Step 4.3: Cross-Platform Testing
- Verify shared authentication
- Test data consistency
- Check both views show same data
- Verify user can switch between views

**Estimated Time:** 30 minutes - 1 hour

---

## 4. View Detection Strategy

### 4.1 Backend Detection

**Method 1: Domain-Based (Recommended)**

```php
protected function isStandaloneView(Request $request): bool
{
    return $request->getHost() === config('domains.local-voices');
}
```

**Method 2: Route-Based**

```php
protected function isStandaloneView(Request $request): bool
{
    return $request->routeIs('localvoices.*');
}
```

**Method 3: Query Parameter (Fallback)**

```php
protected function isStandaloneView(Request $request): bool
{
    return $request->get('view') === 'standalone' 
        || $request->getHost() === config('domains.local-voices');
}
```

### 4.2 Frontend Detection

**In React Components:**

```typescript
// Detect view mode from props
const { viewMode } = usePage().props;

// Or detect from URL
const isStandalone = window.location.hostname === 'localvoices.com';

// Use for conditional rendering
{isStandalone ? <LocalVoicesHeader /> : <DayNewsHeader />}
```

---

## 5. Shared Data & State

### 5.1 Authentication
- ✅ **Shared** - Same Laravel session
- ✅ User logged in on Day.News = logged in on Local Voices
- ✅ Same user model and authentication system

### 5.2 Data Consistency
- ✅ **Shared** - Same database tables
- ✅ Podcast created in one view = visible in both
- ✅ Episode uploaded in one view = visible in both
- ✅ Creator profile = same across both views

### 5.3 User Preferences
- ⚠️ **Consider** - View preference (which view user prefers)
- Can store in user settings
- Can use cookies/localStorage for frontend preference

---

## 6. Code Examples

### 6.1 Updated Controller

```php
<?php

namespace App\Http\Controllers\DayNews;

use App\Http\Controllers\Controller;
use App\Models\CreatorProfile;
use App\Services\DayNews\PodcastService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CreatorController extends Controller
{
    public function __construct(
        private readonly PodcastService $podcastService
    ) {}

    /**
     * Display local voices (podcasts) listing
     */
    public function index(Request $request): Response
    {
        $currentRegion = $request->attributes->get('detected_region');
        $category = $request->get('category', 'all');
        $sort = $request->get('sort', 'trending');
        $search = $request->get('search', '');

        // ... existing query logic ...

        $podcasts = $query->paginate(20)->withQueryString();

        // Detect which frontend to render
        $viewPath = $this->getViewPath($request, 'index');
        $viewMode = $this->getViewMode($request);

        return Inertia::render($viewPath, [
            'podcasts' => $podcasts,
            'filters' => [
                'category' => $category,
                'sort' => $sort,
                'search' => $search,
            ],
            'currentRegion' => $currentRegion,
            'viewMode' => $viewMode,
        ]);
    }

    /**
     * Get the view path based on domain/route
     */
    protected function getViewPath(Request $request, string $page): string
    {
        if ($this->isStandaloneView($request)) {
            return "local-voices/{$page}";
        }
        
        return "day-news/local-voices/{$page}";
    }

    /**
     * Get view mode for frontend
     */
    protected function getViewMode(Request $request): string
    {
        return $this->isStandaloneView($request) ? 'standalone' : 'integrated';
    }

    /**
     * Check if this is standalone view
     */
    protected function isStandaloneView(Request $request): bool
    {
        return $request->getHost() === config('domains.local-voices')
            || $request->routeIs('localvoices.*');
    }

    // ... rest of methods with same pattern ...
}
```

### 6.2 Standalone Header Component

```typescript
// resources/js/components/local-voices/local-voices-header.tsx
import { Link, router } from "@inertiajs/react";
import { Mic, Search, Plus, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocalVoicesHeaderProps {
    auth?: Auth;
}

export default function LocalVoicesHeader({ auth }: LocalVoicesHeaderProps) {
    return (
        <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
                            <Mic className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Local Voices
                            </span>
                            <p className="text-xs text-gray-500">Community Podcasts</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link 
                            href="/" 
                            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition"
                        >
                            Browse
                        </Link>
                        {auth && (
                            <>
                                <Link 
                                    href="/dashboard" 
                                    className="text-sm font-medium text-gray-700 hover:text-purple-600 transition"
                                >
                                    Dashboard
                                </Link>
                                <Link href="/podcasts/create">
                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Podcast
                                    </Button>
                                </Link>
                            </>
                        )}
                        <Link 
                            href="https://day.news" 
                            className="text-sm text-gray-500 hover:text-gray-700 transition"
                        >
                            Day.News →
                        </Link>
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {auth ? (
                            <Avatar>
                                <AvatarImage src={auth.user.avatar} />
                                <AvatarFallback>{auth.user.name[0]}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <Link href="/login">
                                <Button variant="outline" size="sm">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
```

### 6.3 Standalone Layout

```typescript
// resources/js/layouts/local-voices-layout.tsx
import { ReactNode } from "react";
import LocalVoicesHeader from "@/components/local-voices/local-voices-header";
import LocalVoicesFooter from "@/components/local-voices/local-voices-footer";

interface LocalVoicesLayoutProps {
    children: ReactNode;
    auth?: Auth;
}

export default function LocalVoicesLayout({ children, auth }: LocalVoicesLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <LocalVoicesHeader auth={auth} />
            <main className="flex-1">
                {children}
            </main>
            <LocalVoicesFooter />
        </div>
    );
}
```

### 6.4 Standalone Index Page

```typescript
// resources/js/pages/local-voices/index.tsx
import { Head, Link, useForm } from "@inertiajs/react";
import LocalVoicesLayout from "@/layouts/local-voices-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mic, Plus } from "lucide-react";

export default function LocalVoicesIndex({ auth, podcasts, filters, viewMode }) {
    const searchForm = useForm({
        search: filters.search || "",
        category: filters.category || "all",
        sort: filters.sort || "trending",
    });

    return (
        <LocalVoicesLayout auth={auth}>
            <Head title="Local Voices - Community Podcasts" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Local Voices
                    </h1>
                    <p className="text-gray-600">Discover community podcasts and audio content</p>
                </div>

                {/* Search and Filters */}
                {/* ... same as Day.News version but with Local Voices styling ... */}

                {/* Podcasts Grid */}
                {/* ... same content, different styling ... */}
            </div>
        </LocalVoicesLayout>
    );
}
```

---

## 7. Styling Strategy

### 7.1 Theme Configuration

**File:** `resources/css/local-voices.css` (new)

```css
:root {
    --lv-primary: #9333ea; /* Purple */
    --lv-secondary: #ec4899; /* Pink */
    --lv-accent: #f3e8ff;
    --lv-background: #fafafa;
    --lv-foreground: #1f2937;
}

.local-voices-theme {
    --primary: var(--lv-primary);
    --secondary: var(--lv-secondary);
    /* ... */
}
```

### 7.2 Conditional Styling

**In Components:**

```typescript
const isStandalone = viewMode === 'standalone';

<div className={cn(
    "podcast-card",
    isStandalone && "local-voices-theme",
    !isStandalone && "day-news-theme"
)}>
    {/* Content */}
</div>
```

---

## 8. Testing Strategy

### 8.1 Test Both Views Independently

**Day.News Integration:**
- [ ] All pages render correctly
- [ ] Navigation works
- [ ] Styling matches Day.News theme
- [ ] Header shows Day.News navigation

**Standalone View:**
- [ ] All pages render correctly
- [ ] Navigation works
- [ ] Styling matches Local Voices theme
- [ ] Header shows Local Voices branding

### 8.2 Test Shared Functionality

- [ ] Create podcast in Day.News view → appears in Standalone view
- [ ] Upload episode in Standalone view → appears in Day.News view
- [ ] User authentication works in both views
- [ ] Data consistency across both views

### 8.3 Test Cross-Platform Navigation

- [ ] Link from Day.News to Local Voices works
- [ ] Link from Local Voices to Day.News works
- [ ] Authentication state persists
- [ ] User preferences maintained

---

## 9. Effort Estimation

### Total Estimated Time: **12-17 hours**

| Phase | Task | Time Estimate |
|-------|------|---------------|
| **Phase 1** | Backend Updates | 2-3 hours |
| | - Update controllers | 1-2 hours |
| | - Create routes | 30 minutes |
| | - Configure domains | 30 min - 1 hour |
| **Phase 2** | Standalone Frontend | 6-8 hours |
| | - Create header | 1-2 hours |
| | - Create layout | 1 hour |
| | - Create pages | 3-4 hours |
| | - Shared components | 1-2 hours |
| **Phase 3** | Branding & Styling | 2-3 hours |
| | - Brand assets | 1-2 hours |
| | - Apply branding | 1 hour |
| **Phase 4** | Integration & Testing | 2-3 hours |
| | - Test Day.News view | 1 hour |
| | - Test standalone view | 1 hour |
| | - Cross-platform testing | 30 min - 1 hour |

**Complexity:** ⭐⭐⭐☆☆ (Medium)

---

## 10. Benefits of Dual-View Approach

### ✅ Advantages

1. **Flexibility**
   - Users can choose their preferred experience
   - Can market Local Voices independently
   - Can A/B test different designs

2. **Brand Separation**
   - Standalone can have distinct brand identity
   - Day.News integration maintains consistency
   - Both can evolve independently

3. **Shared Infrastructure**
   - Single backend to maintain
   - Same database = data consistency
   - Same authentication system
   - Cost-effective

4. **User Choice**
   - Power users can use standalone
   - Casual users can access via Day.News
   - Seamless switching between views

5. **Marketing**
   - Can promote Local Voices as separate product
   - Can integrate into Day.News for discovery
   - Best of both worlds

### ⚠️ Considerations

1. **Maintenance**
   - Two frontends to maintain
   - Need to keep features in sync
   - More testing required

2. **Code Duplication**
   - Some component duplication
   - Can mitigate with shared components

3. **Styling Consistency**
   - Need to ensure both look polished
   - Different themes but same quality

---

## 11. Recommended Implementation Order

1. **Phase 1: Backend** (2-3 hours)
   - Update controllers for view detection
   - Create standalone routes
   - Configure domain routing

2. **Phase 2: Standalone Frontend** (6-8 hours)
   - Create header and layout
   - Copy and adapt pages
   - Create shared components

3. **Phase 3: Branding** (2-3 hours)
   - Design brand assets
   - Apply to standalone view
   - Ensure Day.News view still works

4. **Phase 4: Testing** (2-3 hours)
   - Test both views
   - Test shared functionality
   - Test cross-platform navigation

**Total:** 12-17 hours

---

## 12. Next Steps

1. ✅ Review and approve plan
2. ⏭️ Configure domain (localvoices.com or subdomain)
3. ⏭️ Update backend controllers
4. ⏭️ Create standalone frontend
5. ⏭️ Apply branding
6. ⏭️ Test thoroughly
7. ⏭️ Deploy

---

## Conclusion

This dual-view approach gives you:
- ✅ **Two distinct experiences** with same functionality
- ✅ **Shared backend** for efficiency
- ✅ **Independent branding** for marketing
- ✅ **User choice** for better UX
- ✅ **Future flexibility** for evolution

The implementation is straightforward since the backend is already well-isolated. The main work is creating the standalone frontend with different styling/branding.

