# Advertisement Implementation Recommendation

**Date:** December 22, 2025  
**Question:** Blade + React vs Pure React/Inertia for ad implementation

---

## Current Architecture Analysis

### Stack Overview
- **Backend:** Laravel 12.43.1
- **Frontend:** React 19.2.3 via Inertia.js v2
- **Build Tool:** Vite 7.3.0
- **Current Pattern:** Primarily React/Inertia with minimal Blade usage

### Current Ad Implementation
- ✅ `Advertisement` model exists
- ✅ `AdvertisementService` exists
- ✅ API endpoint: `/api/advertisements`
- ✅ React component: `resources/js/components/day-news/advertisement.tsx`
- ✅ Currently fetching ads via API calls in React (`useEffect` + `fetch`)

---

## Recommendation: **Pure React/Inertia Implementation** ✅

### Why NOT Blade + React Hybrid?

#### ❌ Issues with Blade `<x-ad-slot>` Component:

1. **Breaks SPA Experience**
   - Blade components require server-side rendering
   - Can't leverage Inertia's client-side navigation
   - Causes hydration mismatches
   - Slower page transitions

2. **State Management Problems**
   - Blade components can't share state with React
   - Can't use React Context or hooks
   - Difficult to coordinate with React ad tracking
   - Viewability tracking becomes complex

3. **Inconsistent Architecture**
   - Your codebase is 95% React/Inertia
   - Blade is only used for:
     - `app.blade.php` wrapper (required by Inertia)
     - Filament admin panel (separate system)
   - Adding Blade components breaks consistency

4. **Performance Issues**
   - Server-side rendering overhead for ads
   - Can't lazy load or optimize ad loading
   - Harder to implement viewability tracking
   - No client-side caching

5. **Developer Experience**
   - Two different component systems to maintain
   - Harder to debug (Blade vs React)
   - Can't use React DevTools for Blade components
   - More complex build process

---

## ✅ Recommended: Pure React/Inertia Implementation

### Architecture Pattern

```
Controller → Inertia Props → React Component → Viewability Tracking
```

### Implementation Approach

#### 1. **Controller: Pass Ads via Inertia Props**

```php
// app/Http/Controllers/DayNews/PostController.php
public function show(Post $post): Response
{
    $region = $post->regions->first();
    
    $ads = [
        'sidebar' => $this->adService->getActiveAds('day_news', $region, 'sidebar')->take(3),
        'banner' => $this->adService->getActiveAds('day_news', $region, 'banner')->take(1),
        'inline' => $this->adService->getActiveAds('day_news', $region, 'inline')->take(3),
    ];
    
    return Inertia::render('day-news/posts/show', [
        'post' => $post->load('regions', 'author'),
        'advertisements' => [
            'sidebar' => $ads['sidebar']->map(fn($ad) => [
                'id' => $ad->id,
                'placement' => $ad->placement,
                'title' => $ad->advertable->title,
                'image' => $ad->advertable->featured_image,
                'url' => route('daynews.posts.show', $ad->advertable->slug),
                // ... other ad data
            ]),
            'banner' => $ads['banner']->map(...),
            'inline' => $ads['inline']->map(...),
        ],
    ]);
}
```

#### 2. **React AdSlot Component with Viewability Tracking**

```tsx
// resources/js/components/common/ad-slot.tsx
import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

interface Ad {
    id: number;
    placement: string;
    title: string;
    image: string;
    url: string;
    // ... other fields
}

interface AdSlotProps {
    ads: Ad[];
    placement: 'sidebar' | 'banner' | 'inline' | 'mobile';
    className?: string;
}

export function AdSlot({ ads, placement, className }: AdSlotProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [trackedAds, setTrackedAds] = useState<Set<number>>(new Set());

    // Intersection Observer for viewability tracking
    useEffect(() => {
        if (!adRef.current || ads.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        setIsVisible(true);
                        
                        // Track impression for each ad
                        ads.forEach((ad) => {
                            if (!trackedAds.has(ad.id)) {
                                trackImpression(ad.id);
                                setTrackedAds((prev) => new Set(prev).add(ad.id));
                            }
                        });
                    }
                });
            },
            {
                threshold: 0.5, // 50% visible
                rootMargin: '0px',
            }
        );

        observer.observe(adRef.current);

        return () => observer.disconnect();
    }, [ads, trackedAds]);

    const trackImpression = (adId: number) => {
        router.post(`/api/advertisements/${adId}/impression`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: [], // Don't reload any props
        });
    };

    const trackClick = (adId: number) => {
        router.post(`/api/advertisements/${adId}/click`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: [],
        });
    };

    if (ads.length === 0) return null;

    return (
        <div ref={adRef} className={className}>
            {ads.map((ad) => (
                <div
                    key={ad.id}
                    className="ad-container"
                    onClick={() => trackClick(ad.id)}
                >
                    <a href={ad.url} target="_blank" rel="noopener noreferrer">
                        <img src={ad.image} alt={ad.title} />
                        <div className="ad-content">
                            <h3>{ad.title}</h3>
                            <span className="ad-label">Advertisement</span>
                        </div>
                    </a>
                </div>
            ))}
        </div>
    );
}
```

#### 3. **Responsive CSS (Tailwind)**

```tsx
// Usage in page component
export default function PostShow({ post, advertisements }: Props) {
    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main content */}
                <main className="lg:col-span-3">
                    <article>{post.content}</article>
                    
                    {/* Inline ads - visible on all devices */}
                    <AdSlot 
                        ads={advertisements.inline} 
                        placement="inline"
                        className="my-8"
                    />
                </main>
                
                {/* Sidebar - hidden on mobile */}
                <aside className="hidden lg:block lg:col-span-1">
                    <AdSlot 
                        ads={advertisements.sidebar} 
                        placement="sidebar"
                        className="sticky top-4"
                    />
                </aside>
            </div>
            
            {/* Mobile-specific ads - visible only on mobile */}
            <div className="lg:hidden mt-8">
                <AdSlot 
                    ads={advertisements.mobile || advertisements.sidebar} 
                    placement="mobile"
                    className="mobile-ads"
                />
            </div>
        </div>
    );
}
```

#### 4. **Shared Props via HandleInertiaRequests (Optional)**

If ads are needed globally, add to shared props:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        // ... existing shared props
        
        // Optionally share ads for common placements
        'globalAds' => [
            'header' => $this->adService->getActiveAds(
                $this->getPlatform($request),
                $this->getRegion($request),
                'banner'
            )->take(1),
        ],
    ];
}
```

---

## Benefits of Pure React/Inertia Approach

### ✅ **Consistency**
- Matches your existing architecture (95% React)
- Single component system to maintain
- Consistent developer experience

### ✅ **Performance**
- Client-side rendering (faster)
- Lazy loading support
- Better caching strategies
- No hydration mismatches

### ✅ **Viewability Tracking**
- Native Intersection Observer API
- Accurate viewability metrics
- Real-time tracking
- Better analytics

### ✅ **State Management**
- Can use React Context for ad state
- Easy to coordinate with other React components
- Better debugging with React DevTools

### ✅ **SPA Experience**
- No page reloads
- Smooth transitions
- Better user experience
- Faster navigation

### ✅ **Responsive Design**
- Easy with Tailwind CSS
- Conditional rendering based on screen size
- Mobile-specific ad placements
- Better control over ad visibility

---

## Implementation Checklist

### Phase 1: Controller Updates
- [ ] Update controllers to pass ads via Inertia props
- [ ] Remove API fetch calls from React components
- [ ] Add ad data to shared props (if needed globally)

### Phase 2: React Component
- [ ] Create `AdSlot` component with viewability tracking
- [ ] Implement Intersection Observer
- [ ] Add impression/click tracking
- [ ] Add responsive CSS classes

### Phase 3: Integration
- [ ] Replace API calls with Inertia props
- [ ] Add AdSlot to pages
- [ ] Test viewability tracking
- [ ] Test responsive behavior

### Phase 4: Optimization
- [ ] Add lazy loading for ads
- [ ] Implement ad caching
- [ ] Add loading states
- [ ] Optimize Intersection Observer thresholds

---

## When Blade Components Make Sense

Blade components are appropriate for:
- ✅ **SEO-critical content** (but ads aren't SEO-critical)
- ✅ **Server-side only rendering** (but ads benefit from client-side)
- ✅ **Filament admin panels** (separate system)
- ✅ **Email templates** (server-side only)

**For ads:** Pure React/Inertia is the better choice.

---

## Example: Complete Implementation

### Controller
```php
public function show(Post $post): Response
{
    $region = $post->regions->first();
    
    return Inertia::render('day-news/posts/show', [
        'post' => $post,
        'advertisements' => [
            'sidebar' => $this->adService->getActiveAds('day_news', $region, 'sidebar')
                ->take(3)
                ->map(fn($ad) => $this->formatAd($ad)),
            'banner' => $this->adService->getActiveAds('day_news', $region, 'banner')
                ->take(1)
                ->map(fn($ad) => $this->formatAd($ad)),
            'inline' => $this->adService->getActiveAds('day_news', $region, 'inline')
                ->take(3)
                ->map(fn($ad) => $this->formatAd($ad)),
        ],
    ]);
}

private function formatAd(Advertisement $ad): array
{
    return [
        'id' => $ad->id,
        'placement' => $ad->placement,
        'title' => $ad->advertable->title,
        'image' => $ad->advertable->featured_image,
        'url' => route('daynews.posts.show', $ad->advertable->slug),
        'excerpt' => $ad->advertable->excerpt,
    ];
}
```

### React Page Component
```tsx
import { AdSlot } from '@/components/common/ad-slot';

interface Props {
    post: Post;
    advertisements: {
        sidebar: Ad[];
        banner: Ad[];
        inline: Ad[];
    };
}

export default function PostShow({ post, advertisements }: Props) {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Banner ad - top of page */}
            <AdSlot 
                ads={advertisements.banner} 
                placement="banner"
                className="mb-8"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main content */}
                <article className="lg:col-span-3">
                    <h1>{post.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    
                    {/* Inline ads */}
                    <AdSlot 
                        ads={advertisements.inline} 
                        placement="inline"
                        className="my-8"
                    />
                </article>
                
                {/* Sidebar ads - desktop only */}
                <aside className="hidden lg:block lg:col-span-1">
                    <AdSlot 
                        ads={advertisements.sidebar} 
                        placement="sidebar"
                        className="sticky top-4 space-y-4"
                    />
                </aside>
            </div>
            
            {/* Mobile sidebar ads */}
            <div className="lg:hidden mt-8">
                <AdSlot 
                    ads={advertisements.sidebar} 
                    placement="mobile"
                    className="mobile-ads"
                />
            </div>
        </div>
    );
}
```

---

## Summary

**Recommendation: Pure React/Inertia Implementation** ✅

**Why:**
1. Matches your current architecture (React-focused)
2. Better performance and user experience
3. Easier viewability tracking with Intersection Observer
4. Consistent developer experience
5. Better state management
6. No hydration issues

**Avoid Blade components for ads** because:
- They break SPA experience
- Harder to track viewability
- Inconsistent with your architecture
- Performance overhead

**Your current approach** (API calls in React) is close, but **passing via Inertia props is better** because:
- Fewer HTTP requests
- Better performance
- Server-side filtering/optimization
- Cleaner code

---

**Ready to implement?** Follow the checklist above! 🚀

