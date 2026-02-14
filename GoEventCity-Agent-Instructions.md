# GO EVENT CITY — Agent Implementation Instructions

## For: Cursor AI Agents / Antigravity
## Repo: github.com/shinejohn/Community-Platform
## Branch: Create `feature/events-system-v2` from `main`
## Date: February 2026

---

## PLATFORM CONTEXT

This is a **Laravel 12 + React 19 + Inertia.js** multisite platform. Five sites share one codebase: GoEventCity, Day.News, Downtown Guide, AlphaSite, GoLocalVoices.

### Tech Stack
- **Backend**: PHP 8.3+, Laravel 12.43, PostgreSQL, Redis, Horizon
- **Frontend**: React 19, TypeScript, Inertia.js 2.3, Tailwind CSS 4, Radix UI, Lucide Icons
- **Payments**: Stripe (stripe-php 19.1)
- **Auth**: Laravel Sanctum 4.2
- **Admin**: Filament 4.3
- **Maps**: @vis.gl/react-google-maps
- **Deployment**: Railway (current), AWS (target)

### Codebase Patterns — FOLLOW THESE EXACTLY

**PHP files** — Every PHP file starts with:
```php
<?php

declare(strict_types=1);

namespace App\{folder};
```

**Models** — All models use UUID primary keys via `HasUuid` concern:
```php
use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class MyModel extends Model
{
    use HasFactory, HasUuid;
    // ...
}
```

**Controllers** — All controllers are `final class`:
```php
final class MyController extends Controller
{
    public function __construct(
        private readonly MyService $myService
    ) {}
}
```

**Services** — All services are `final class` with constructor injection.

**Migrations** — Use UUID primary keys, timestamps, soft deletes:
```php
$table->uuid('id')->primary();
$table->timestamps();
$table->softDeletes();
```

**Frontend Pages** — Located at `resources/js/pages/event-city/`. Use Inertia:
```tsx
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
```

**Components** — Radix UI primitives in `resources/js/components/ui/`. Shared reusable components in `resources/js/components/shared/` or feature-specific dirs.

**Types** — TypeScript interfaces in `resources/js/types/`.

**Routes** — Event City routes in `routes/web.php`. Auth routes wrapped in `Route::middleware(['auth', 'verified'])`.

---

## AGENT TASK STRUCTURE

Each task below is designed to be executed by a **single Cursor agent**. Tasks are ordered by dependency — complete them in sequence. Each task lists:
- **Creates**: New files to create
- **Modifies**: Existing files to edit
- **Tests**: What to verify after completion
- **Dependencies**: Other tasks that must be done first

---

# PHASE 0 — CRITICAL CODEBASE FIXES

> **Priority**: These MUST be completed before any feature work. They fix production-safety issues.

---

## TASK 0.1: Ticket Inventory Locking

**Problem**: No `lockForUpdate()` in ticket purchase flow. Concurrent purchases can oversell.

**Modifies**:
- `app/Services/TicketPaymentService.php`

**Implementation**:
1. Open `app/Services/TicketPaymentService.php` (114 lines)
2. Find the `createCheckoutSession()` method
3. Before creating the Stripe session, add a DB transaction with pessimistic locking:

```php
use Illuminate\Support\Facades\DB;

public function reserveInventory(TicketOrder $order): void
{
    DB::transaction(function () use ($order) {
        foreach ($order->items as $item) {
            $ticketPlan = \App\Models\TicketPlan::where('id', $item->ticket_plan_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($ticketPlan->available_quantity < $item->quantity) {
                throw new \Exception("Insufficient inventory for {$ticketPlan->name}. Only {$ticketPlan->available_quantity} remaining.");
            }

            $ticketPlan->decrement('available_quantity', $item->quantity);
        }
    });
}
```

4. Call `$this->reserveInventory($order)` BEFORE `createCheckoutSession()`
5. Add a `releaseInventory(TicketOrder $order)` method for failed/cancelled payments that increments `available_quantity` back
6. Wire `releaseInventory()` into the checkout cancel flow in `app/Http/Controllers/TicketOrderController.php`

**Tests**: Write a test in `tests/Feature/TicketInventoryLockingTest.php` that simulates concurrent purchases and verifies no overselling.

---

## TASK 0.2: Enable Foreign Keys in Ticket Migrations

**Problem**: 15+ instances of `// FK DISABLED` across 4 ticket migration files.

**Modifies**: DO NOT modify existing migrations. Create a NEW migration.

**Creates**:
- `database/migrations/{timestamp}_add_foreign_keys_to_ticket_tables.php`

**Implementation**:
1. Create a new migration: `php artisan make:migration add_foreign_keys_to_ticket_tables`
2. In the `up()` method, add foreign key constraints for ALL disabled FKs:

```php
// ticket_plans
Schema::table('ticket_plans', function (Blueprint $table) {
    $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
});

// ticket_orders
Schema::table('ticket_orders', function (Blueprint $table) {
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
});

// ticket_order_items
Schema::table('ticket_order_items', function (Blueprint $table) {
    $table->foreign('ticket_order_id')->references('id')->on('ticket_orders')->cascadeOnDelete();
    $table->foreign('ticket_plan_id')->references('id')->on('ticket_plans')->cascadeOnDelete();
});

// ticket_listings
Schema::table('ticket_listings', function (Blueprint $table) {
    $table->foreign('ticket_order_item_id')->references('id')->on('ticket_order_items')->cascadeOnDelete();
    $table->foreign('seller_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('buyer_id')->references('id')->on('users')->nullOnDelete();
    $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
});

// ticket_transfers
Schema::table('ticket_transfers', function (Blueprint $table) {
    $table->foreign('ticket_order_item_id')->references('id')->on('ticket_order_items')->cascadeOnDelete();
    $table->foreign('from_user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('to_user_id')->references('id')->on('users')->nullOnDelete();
});

// ticket_gifts
Schema::table('ticket_gifts', function (Blueprint $table) {
    $table->foreign('ticket_order_item_id')->references('id')->on('ticket_order_items')->cascadeOnDelete();
    $table->foreign('gifter_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('recipient_id')->references('id')->on('users')->nullOnDelete();
});
```

3. In `down()`, drop all the foreign keys you added
4. Verify column types match (both sides must be `uuid`)

**Tests**: Run `php artisan migrate` on a fresh database. Verify no errors.

---

## TASK 0.3: Fix Stripe Discount Handling

**Problem**: `TicketPaymentService` uses negative line items for discounts. Stripe Checkout does not support negative amounts.

**Modifies**:
- `app/Services/TicketPaymentService.php`

**Implementation**:
1. Open `app/Services/TicketPaymentService.php`
2. Find the section that creates a discount line item with negative `unit_amount`
3. Remove the negative line item block entirely
4. Replace with Stripe Coupon/Promotion Code approach:

```php
// If there's a discount, create a Stripe coupon
$sessionParams = [
    'mode' => 'payment',
    'line_items' => $lineItems,
    'success_url' => $successUrl,
    'cancel_url' => $cancelUrl,
    'metadata' => ['order_id' => $order->id],
];

if ($order->discount > 0) {
    $coupon = $stripe->coupons->create([
        'amount_off' => (int) ($order->discount * 100),
        'currency' => 'usd',
        'duration' => 'once',
        'name' => "Order Discount - {$order->id}",
    ]);
    $sessionParams['discounts'] = [['coupon' => $coupon->id]];
}

return $stripe->checkout->sessions->create($sessionParams);
```

**Tests**: Verify a ticket purchase with a discount code completes successfully through Stripe Checkout.

---

## TASK 0.4: Fix Venue Distance Sorting

**Problem**: `Venue::getDistanceAttribute()` returns hardcoded `0.0`. The `scopeWithinRadius()` has a working Haversine formula but the accessor ignores it.

**Modifies**:
- `app/Models/Venue.php` (line ~98)

**Implementation**:
1. Open `app/Models/Venue.php`
2. Replace the `getDistanceAttribute()` method:

```php
public function getDistanceAttribute(): float
{
    // If distance was calculated via scopeWithinRadius, use that
    if (isset($this->attributes['distance'])) {
        return round((float) $this->attributes['distance'], 2);
    }

    // Otherwise return 0 (no user location available)
    return 0.0;
}
```

3. Now, update `app/Http/Controllers/VenueController.php` to use the radius scope when user location is available. Find the `publicIndex` method and add:

```php
if ($request->filled('latitude') && $request->filled('longitude')) {
    $radius = $request->float('radius', 50); // default 50km
    $query->withinRadius($request->float('latitude'), $request->float('longitude'), $radius);
    $sortBy = 'distance'; // Override sort to distance when location provided
}
```

**Tests**: Verify venues sort by distance when lat/lng params are provided.

---

## TASK 0.5: Fix Amenities Filter (AND → OR)

**Problem**: `VenueController` lines 65-71 use `whereJsonContains` in a foreach loop, requiring ALL amenities to match.

**Modifies**:
- `app/Http/Controllers/VenueController.php` (~line 65-71)

**Implementation**:
1. Find the amenities filter block (currently):
```php
$query->where(function ($q) use ($amenities) {
    foreach ($amenities as $amenity) {
        $q->whereJsonContains('amenities', $amenity);
    }
});
```

2. Replace with OR logic:
```php
$query->where(function ($q) use ($amenities) {
    foreach ($amenities as $amenity) {
        $q->orWhereJsonContains('amenities', $amenity);
    }
});
```

**Tests**: Search venues with multiple amenities selected. Verify results include venues with ANY of the selected amenities, not just venues with ALL of them.

---

## TASK 0.6: Remove Mock Data

**Problem**: `VenueController` line ~207 has `'eventsThisWeek' => 427`.

**Modifies**:
- `app/Http/Controllers/VenueController.php` (~line 207)

**Implementation**:
Replace:
```php
'eventsThisWeek' => 427, // Mock data
```
With:
```php
'eventsThisWeek' => Event::published()
    ->where('event_date', '>=', now()->startOfWeek())
    ->where('event_date', '<=', now()->endOfWeek())
    ->count(),
```

Add `use App\Models\Event;` at the top if not already imported.

---

## TASK 0.7: Fix Price Range Scope

**Problem**: `Event::scopeWithinPriceRange()` requires price_min >= $min AND price_max <= $max, missing overlapping ranges.

**Modifies**:
- `app/Models/Event.php`

**Implementation**:
Replace the current `scopeWithinPriceRange` with overlapping range logic:
```php
public function scopeWithinPriceRange($query, float $min, float $max)
{
    return $query->where(function ($q) use ($min, $max) {
        $q->where('is_free', true)
            ->orWhere(function ($q2) use ($min, $max) {
                // Overlapping range: event overlaps with filter range
                $q2->where('price_min', '<=', $max)
                    ->where('price_max', '>=', $min);
            });
    });
}
```

**Tests**: Verify an event priced $20-$50 appears when filtering for $10-$30 range (overlapping).

---

# PHASE 1 — FOUNDATION FEATURES

> **Goal**: Fix what partially exists. Wire up backends that already work to frontends that need them.

---

## TASK 1.1: Reusable FollowButton Component

**Dependencies**: None

**Creates**:
- `resources/js/components/shared/FollowButton.tsx`

**Modifies**:
- `resources/js/pages/event-city/events/event-detail.tsx` — add FollowButton
- `resources/js/pages/event-city/performers/show.tsx` — add FollowButton
- `resources/js/pages/event-city/venues/show.tsx` — add FollowButton
- `resources/js/pages/event-city/calendars/show.tsx` — add FollowButton

**Implementation**:
The backend is COMPLETE. `FollowController` at `app/Http/Controllers/FollowController.php` (88 lines) has:
- `POST /api/follow/toggle` — accepts `followable_type` (event|performer|venue|calendar) and `followable_id`
- `GET /api/follow/status` — returns `{ following: boolean }`

Create a reusable React component:

```tsx
// resources/js/components/shared/FollowButton.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Heart } from "lucide-react";

interface FollowButtonProps {
  followableType: "event" | "performer" | "venue" | "calendar";
  followableId: string;
  showCount?: boolean;
  className?: string;
}

export default function FollowButton({ followableType, followableId, showCount = false, className }: FollowButtonProps) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/follow/status", {
      params: { followable_type: followableType, followable_id: followableId }
    }).then(res => {
      setFollowing(res.data.following);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [followableType, followableId]);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/follow/toggle", {
        followable_type: followableType,
        followable_id: followableId,
      });
      setFollowing(res.data.following);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading} className={className}>
      <Heart className={following ? "fill-red-500 text-red-500" : "text-gray-400"} size={20} />
      <span>{following ? "Following" : "Follow"}</span>
    </button>
  );
}
```

Add this component to:
1. `event-detail.tsx` — next to the event title area
2. `performers/show.tsx` — in the performer profile header
3. `venues/show.tsx` — next to the venue name
4. `calendars/show.tsx` — next to the calendar title

---

## TASK 1.2: AddToCalendar Component + iCal Export

**Dependencies**: None

**Creates**:
- `resources/js/components/shared/AddToCalendarButton.tsx`
- `app/Http/Controllers/Api/ICalExportController.php`

**Modifies**:
- `resources/js/pages/event-city/events/event-detail.tsx` — add AddToCalendar button
- `routes/web.php` — add iCal export route

**Implementation**:

**Backend** — Create `app/Http/Controllers/Api/ICalExportController.php`:
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Response;

final class ICalExportController extends Controller
{
    public function event(Event $event): Response
    {
        $ical = $this->generateICal($event);

        return response($ical, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="event-' . $event->id . '.ics"',
        ]);
    }

    private function generateICal(Event $event): string
    {
        $start = $event->event_date->format('Ymd\THis\Z');
        $end = $event->event_date->addHours(2)->format('Ymd\THis\Z'); // Default 2hr duration
        $now = now()->format('Ymd\THis\Z');
        $venue = $event->venue;
        $location = $venue ? "{$venue->name}, {$venue->address}" : '';

        return "BEGIN:VCALENDAR\r\n" .
            "VERSION:2.0\r\n" .
            "PRODID:-//Go Event City//Events//EN\r\n" .
            "BEGIN:VEVENT\r\n" .
            "UID:{$event->id}@goeventcity.com\r\n" .
            "DTSTAMP:{$now}\r\n" .
            "DTSTART:{$start}\r\n" .
            "DTEND:{$end}\r\n" .
            "SUMMARY:" . $this->escapeIcal($event->title) . "\r\n" .
            "DESCRIPTION:" . $this->escapeIcal(strip_tags($event->description ?? '')) . "\r\n" .
            "LOCATION:" . $this->escapeIcal($location) . "\r\n" .
            "URL:" . route('events.show', $event) . "\r\n" .
            "END:VEVENT\r\n" .
            "END:VCALENDAR\r\n";
    }

    private function escapeIcal(string $text): string
    {
        return str_replace(["\n", ",", ";"], ["\\n", "\\,", "\\;"], $text);
    }
}
```

Add route in `routes/web.php`:
```php
Route::get('/events/{event}/ical', [App\Http\Controllers\Api\ICalExportController::class, 'event'])->name('events.ical');
```

**Frontend** — Create `AddToCalendarButton.tsx`:
- Button with calendar icon (CalendarPlus from lucide-react)
- Dropdown with two options:
  1. "Add to Go Event City Calendar" — calls existing `POST /calendars/{calendar}/events` (show user's calendars in dropdown)
  2. "Download .ics" — links to `/events/{event}/ical`
- If user has no calendars, show "Create Calendar" link to `/calendars/create`

Wire into `event-detail.tsx` in the event action buttons area.

---

## TASK 1.3: Fix Performer Show Page

**Dependencies**: Task 1.1 (FollowButton)

**Modifies**:
- `resources/js/pages/event-city/performers/show.tsx` (currently only 70 lines — a stub)

**Context**: The backend `PerformerController::show()` (at line ~230) already passes: performer with genres, bio, profile_image, cover_image, home_city, social_links, website, booking_contact_email, upcoming events, past events, reviews, bookings.

**Implementation**:
Rebuild the performer show page to include:
1. **Hero section**: Cover image background, profile image, name, verified badge (if verified), genres as tags, home city, follower count
2. **FollowButton** (from Task 1.1) in the hero section
3. **Bio section**: Full bio text, social media links (use react-icons for platform icons), website link
4. **Upcoming Events section**: List of upcoming events using the existing `EventCard` component from `resources/js/components/shared/events/EventCard.tsx`
5. **Past Events section**: Collapsed/expandable list of past events
6. **Reviews section**: Display reviews with star ratings
7. **Booking CTA**: "Book This Performer" button linking to the booking marketplace (if premium)
8. **Related performers**: Similar genre performers

Reference the venue show page (`resources/js/pages/event-city/venues/show.tsx`, 681 lines) for layout patterns — the performer page should be comparable in depth.

---

## TASK 1.4: Improved Ticket Management — My Tickets Page

**Dependencies**: Task 0.1 (inventory locking), Task 0.2 (FKs)

**Modifies**:
- `resources/js/pages/event-city/tickets/my-tickets.tsx` (currently 185 lines — needs expansion)

**Context**: Backend services exist:
- `TicketTransferService` (73 lines) — `createTransfer(ticketOrderItem, fromUser, toEmail)`
- `TicketGiftService` (74 lines) — `createGift(ticketOrderItem, gifter, recipientEmail)`
- `QRCodeService` (107 lines) — `generateForTicketOrderItem(ticketOrderItem)`

**Implementation**:
Expand my-tickets page to include:
1. **Ticket cards**: Each ticket displays event name, date, venue, ticket type, QR code image
2. **QR code display**: Show QR code inline (from `ticket_order_items.qr_code` field). If null, show "Generating..." state
3. **Action buttons per ticket**:
   - "Transfer" — opens modal asking for recipient email, calls transfer API
   - "Gift" — opens modal asking for recipient email + optional message, calls gift API
   - "List for Resale" — opens modal for marketplace listing (links to existing marketplace page)
4. **Ticket status badges**: Active, Transferred, Gifted, Used, Expired
5. **Filter tabs**: Upcoming / Past / Transferred / Gifted
6. **Download ticket**: Button to download .ics for the event

Wire transfer/gift actions to new API endpoints:

**Creates**:
- `app/Http/Controllers/Api/TicketActionController.php`

```php
final class TicketActionController extends Controller
{
    public function transfer(Request $request, TicketOrderItem $ticketOrderItem): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
        ]);

        $transfer = app(TicketTransferService::class)->createTransfer(
            $ticketOrderItem,
            $request->user(),
            $validated['recipient_email']
        );

        return response()->json(['transfer' => $transfer, 'message' => 'Transfer initiated']);
    }

    public function gift(Request $request, TicketOrderItem $ticketOrderItem): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        $gift = app(TicketGiftService::class)->createGift(
            $ticketOrderItem,
            $request->user(),
            $validated['recipient_email'],
            $validated
        );

        return response()->json(['gift' => $gift, 'message' => 'Gift sent']);
    }
}
```

Add routes in `routes/web.php` inside the auth middleware group:
```php
Route::post('/api/tickets/{ticketOrderItem}/transfer', [TicketActionController::class, 'transfer'])->name('api.tickets.transfer');
Route::post('/api/tickets/{ticketOrderItem}/gift', [TicketActionController::class, 'gift'])->name('api.tickets.gift');
```

---

# PHASE 2 — CORE NEW FEATURES

> **Goal**: Build the missing P0 features that drive user engagement and revenue.

---

## TASK 2.1: Share Event System

**Dependencies**: None

**Creates**:
- `app/Http/Controllers/ShareController.php`
- `app/Models/Share.php`
- `database/migrations/{timestamp}_create_shares_table.php`
- `resources/js/components/shared/ShareButton.tsx`

**Implementation**:

**Migration** — `shares` table:
```php
$table->uuid('id')->primary();
$table->uuid('user_id')->nullable();       // null = anonymous share
$table->string('shareable_type');           // App\Models\Event, etc.
$table->uuid('shareable_id');
$table->string('channel');                  // 'link', 'facebook', 'twitter', 'sms', 'email', 'whatsapp', 'copy', 'dm'
$table->string('tracking_code')->unique();  // UTM-style tracking
$table->integer('click_count')->default(0);
$table->timestamps();
$table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
$table->index(['shareable_type', 'shareable_id']);
```

**Model** — `app/Models/Share.php`: Standard polymorphic model with `shareable()` morphTo.

**Controller** — `app/Http/Controllers/ShareController.php`:
- `generateLink(Request)` — creates a Share record, returns shareable URL with tracking code
- `trackClick(string $trackingCode)` — increments click_count, redirects to entity page

**Frontend** — `resources/js/components/shared/ShareButton.tsx`:
- Click opens a popover/modal with share options
- Uses Web Share API (`navigator.share()`) as primary on mobile
- Fallback buttons: Copy Link, Facebook, Twitter/X, WhatsApp, SMS, Email
- "Share with Friend" option sends in-app DM (using existing SocialMessageController)
- Each button calls `POST /api/share/generate` to get a tracked URL before sharing

**Add Open Graph meta tags** — modify `app/Http/Controllers/EventController.php::show()` to pass OG data to the Inertia page. Add meta tags in the page `<Head>` component:
```tsx
<Head>
  <meta property="og:title" content={event.title} />
  <meta property="og:description" content={event.description?.substring(0, 200)} />
  <meta property="og:image" content={event.image} />
  <meta property="og:type" content="event" />
</Head>
```

Wire `ShareButton` into: `event-detail.tsx`, `performers/show.tsx`, `venues/show.tsx`

---

## TASK 2.2: Headliner Tiered Listing System

**Dependencies**: None (but this is one of the most important features — it's a core revenue driver)

**Creates**:
- `app/Models/ListingPromotion.php`
- `database/migrations/{timestamp}_create_listing_promotions_table.php`
- `app/Services/ListingPromotionService.php`
- `app/Http/Controllers/ListingPromotionController.php`
- `resources/js/components/shared/HeadlinerHero.tsx`
- `resources/js/components/shared/PriorityListingCard.tsx`
- `resources/js/components/shared/ListingTierBadge.tsx`
- `resources/js/types/promotions.d.ts`

**Concept**: Every discovery page (events, performers, venues) displays results in 4 tiers:
1. **Headliner** — ONE large hero/billboard at the very top. A single event/performer/venue that has purchased the headliner slot for this community and date range. Displayed as a full-width hero card with large image, prominent title, and CTA.
2. **Priority** — 2-4 elevated listings immediately below the headliner. Purchased ad placement.
3. **Premium** — Listings from Premium-tier subscribers. Appear below Priority, above Basic. Distinguished with a subtle badge/highlight.
4. **Basic** — All free-tier listings. Standard display. Appear last.

**Migration** — `listing_promotions` table:
```php
$table->uuid('id')->primary();
$table->string('promotable_type');          // App\Models\Event, App\Models\Performer, App\Models\Venue
$table->uuid('promotable_id');
$table->string('tier');                     // 'headliner', 'priority'
$table->uuid('community_id')->nullable();   // Scope to specific community (null = all communities)
$table->date('start_date');
$table->date('end_date');
$table->decimal('price_paid', 10, 2);
$table->uuid('purchased_by');              // User who bought it
$table->string('status')->default('active'); // active, expired, cancelled
$table->string('stripe_payment_id')->nullable();
$table->timestamps();
$table->softDeletes();

$table->foreign('purchased_by')->references('id')->on('users');
$table->index(['promotable_type', 'promotable_id']);
$table->index(['tier', 'community_id', 'start_date', 'end_date', 'status']);
// Ensure only one headliner per type per community per date range
$table->unique(['promotable_type', 'tier', 'community_id', 'start_date'], 'unique_headliner_slot');
```

**Model** — `app/Models/ListingPromotion.php`:
- Polymorphic `promotable()` morphTo
- Scopes: `active()`, `headliner()`, `priority()`, `forCommunity($id)`, `currentlyActive()`
- `scopeCurrentlyActive`: where status=active AND start_date <= today AND end_date >= today

**Service** — `app/Services/ListingPromotionService.php`:
```php
final class ListingPromotionService
{
    // Check if headliner slot is available for a community + date range
    public function isHeadlinerAvailable(string $promotableType, ?string $communityId, Carbon $startDate, Carbon $endDate): bool

    // Purchase a promotion slot
    public function purchasePromotion(Model $promotable, string $tier, ?string $communityId, Carbon $startDate, Carbon $endDate, User $purchaser, string $stripePaymentId): ListingPromotion

    // Get the tiered listing order for a discovery page
    public function getTieredListings(string $modelClass, ?string $communityId, Builder $baseQuery): array
    // Returns: ['headliner' => ?Model, 'priority' => Collection, 'premium' => Collection, 'basic' => Collection]
}
```

The `getTieredListings()` method is the core logic:
```php
public function getTieredListings(string $modelClass, ?string $communityId, Builder $baseQuery, int $priorityLimit = 4, int $perPage = 20): array
{
    $today = now()->toDateString();

    // 1. Get headliner (single item)
    $headlinerPromo = ListingPromotion::where('promotable_type', $modelClass)
        ->headliner()
        ->forCommunity($communityId)
        ->currentlyActive()
        ->first();

    $headliner = $headlinerPromo?->promotable;

    // 2. Get priority listings
    $priorityPromoIds = ListingPromotion::where('promotable_type', $modelClass)
        ->priority()
        ->forCommunity($communityId)
        ->currentlyActive()
        ->pluck('promotable_id');

    $priority = $priorityPromoIds->isNotEmpty()
        ? $modelClass::whereIn('id', $priorityPromoIds)->limit($priorityLimit)->get()
        : collect();

    // 3. Get premium subscriber listings (those NOT already in headliner/priority)
    $excludeIds = $priorityPromoIds->merge($headliner ? [$headliner->id] : []);
    // Premium = entities whose owner has a premium business subscription
    $premium = (clone $baseQuery)
        ->whereNotIn('id', $excludeIds)
        ->whereHas('workspace.subscription', fn($q) => $q->where('tier', 'premium')->where('status', 'active'))
        ->limit($perPage)
        ->get();

    // 4. Basic = everything else
    $allExcludeIds = $excludeIds->merge($premium->pluck('id'));
    $basic = (clone $baseQuery)
        ->whereNotIn('id', $allExcludeIds)
        ->paginate($perPage);

    return compact('headliner', 'priority', 'premium', 'basic');
}
```

**Modify discovery controllers** — Update ALL THREE:
1. `app/Http/Controllers/EventController.php` — `publicIndex()` method
2. `app/Http/Controllers/PerformerController.php` — `publicIndex()` method
3. `app/Http/Controllers/VenueController.php` — `publicIndex()` method

In each, inject `ListingPromotionService` and replace the flat query with:
```php
$tieredListings = $this->listingPromotionService->getTieredListings(
    Event::class, // or Performer::class or Venue::class
    $communityId,
    $baseQuery
);

return Inertia::render('event-city/events/index', [
    'headliner' => $tieredListings['headliner'],
    'priorityListings' => $tieredListings['priority'],
    'premiumListings' => $tieredListings['premium'],
    'listings' => $tieredListings['basic'],
    // ... existing filters, etc.
]);
```

**Frontend Components**:

`HeadlinerHero.tsx` — Full-width hero card:
- Large background image (event/performer/venue image)
- Overlay with title, date/location, and CTA button
- "HEADLINER" badge in corner
- Only renders if headliner prop is non-null

`PriorityListingCard.tsx` — Elevated card:
- Slightly larger than standard cards
- Subtle gold/amber border or background tint
- "PRIORITY" small badge
- Used for both Priority and Premium tiers (pass tier as prop)

`ListingTierBadge.tsx` — Small badge component: HEADLINER (gold), PRIORITY (amber), PREMIUM (blue)

**Update listing pages** (events/index.tsx, performers page, venues page):
```tsx
{headliner && <HeadlinerHero item={headliner} type="event" />}
{priorityListings.length > 0 && (
  <section>
    <h2>Featured</h2>
    <div className="grid grid-cols-2 gap-4">
      {priorityListings.map(item => <PriorityListingCard key={item.id} item={item} tier="priority" />)}
    </div>
  </section>
)}
{premiumListings.length > 0 && (
  <section>
    {premiumListings.map(item => <PriorityListingCard key={item.id} item={item} tier="premium" />)}
  </section>
)}
<section>
  {listings.data.map(item => <EventCard key={item.id} event={item} />)}
  {/* pagination */}
</section>
```

**Self-serve purchase flow** (Phase 3 — can stub for now):
- Create `resources/js/pages/event-city/marketing/promote.tsx`
- Form: select entity (your event/performer/venue), select tier (headliner/priority), select community, select date range, see price, pay via Stripe
- Route: `GET /promote` → shows form, `POST /api/promotions/purchase` → processes payment

---

## TASK 2.3: Event Discovery Improvements

**Dependencies**: Task 2.2 (tiered listings integrate into discovery)

**Modifies**:
- `app/Http/Controllers/EventController.php` — `publicIndex()` method
- `app/Services/EventService.php` — add trending and recommendation methods
- `resources/js/pages/event-city/events/index.tsx` — add map view, near me, trending

**Creates**:
- `resources/js/components/events/EventMapView.tsx`
- `resources/js/components/events/NearMeSlider.tsx`
- `resources/js/components/events/TrendingSection.tsx`

**Implementation**:

**Backend — Trending Algorithm** in `EventService.php`:
```php
public function getTrending(int $limit = 10, ?int $communityId = null): Collection
{
    return Event::published()
        ->upcoming()
        ->when($communityId, fn($q) => $q->whereHas('regions', fn($r) => $r->where('regions.id', $communityId)))
        ->withCount(['checkIns as recent_checkins' => fn($q) => $q->where('checked_in_at', '>=', now()->subDays(7))])
        ->selectRaw("events.*, 
            (member_attendance * 2 + member_recommendations * 3 + community_rating * 10) as trending_score")
        ->orderByDesc('trending_score')
        ->limit($limit)
        ->get();
}
```

**Backend — Near Me** — Add to `EventController::publicIndex()`:
```php
if ($request->filled('lat') && $request->filled('lng')) {
    $radius = $request->float('radius', 25); // miles
    $query->whereHas('venue', fn($q) => $q->withinRadius($request->float('lat'), $request->float('lng'), $radius));
}
```

**Frontend — Map View**: Use `@vis.gl/react-google-maps` (already installed):
- Toggle button: "List View" / "Map View"
- Map shows event pins at venue lat/lng
- Clicking a pin shows a popup with event card
- Map bounds filter events shown in sidebar list

**Frontend — Near Me**: Radius slider component using Geolocation API:
```tsx
// Get user location
navigator.geolocation.getCurrentPosition(pos => {
  setLat(pos.coords.latitude);
  setLng(pos.coords.longitude);
});
```
- Slider: 5mi / 10mi / 25mi / 50mi / 100mi
- Sends lat, lng, radius as query params to filter

**Frontend — Trending Section**: Horizontal scroll carousel of trending events above the main list.

---

## TASK 2.4: Ticket Check-In System

**Dependencies**: Task 0.1 (locking), Task 0.2 (FKs)

**Creates**:
- `app/Services/TicketCheckInService.php`
- `app/Http/Controllers/TicketCheckInController.php`
- `resources/js/pages/event-city/check-ins/scanner.tsx`
- `resources/js/pages/event-city/check-ins/dashboard.tsx`
- `resources/js/components/check-in/QRScanner.tsx`

**Implementation**:

**Service** — `app/Services/TicketCheckInService.php`:
```php
final class TicketCheckInService
{
    public function checkInByTicketCode(string $ticketCode, User $staffUser): array
    {
        return DB::transaction(function () use ($ticketCode, $staffUser) {
            $ticketItem = TicketOrderItem::where('ticket_code', $ticketCode)
                ->lockForUpdate()
                ->firstOrFail();

            if ($ticketItem->checked_in_at !== null) {
                return ['success' => false, 'error' => 'Ticket already used', 'ticket' => $ticketItem];
            }

            if ($ticketItem->status === 'transferred' || $ticketItem->status === 'gifted') {
                return ['success' => false, 'error' => 'Ticket has been transferred/gifted', 'ticket' => $ticketItem];
            }

            $ticketItem->update([
                'checked_in_at' => now(),
                'checked_in_by' => $staffUser->id,
            ]);

            // Also create a CheckIn record for the event
            $order = $ticketItem->ticketOrder;
            CheckIn::create([
                'event_id' => $order->event_id,
                'user_id' => $order->user_id,
                'checked_in_at' => now(),
                'is_public' => true,
            ]);

            // Increment event attendance
            Event::where('id', $order->event_id)->increment('member_attendance');

            return ['success' => true, 'ticket' => $ticketItem->fresh()->load('ticketOrder.event', 'ticketPlan')];
        });
    }
}
```

NOTE: Add `checked_in_at` and `checked_in_by` columns to `ticket_order_items` table via a new migration if they don't exist.

**Controller** — `app/Http/Controllers/TicketCheckInController.php`:
- `scan(Request)` — POST with `ticket_code`, returns check-in result as JSON
- `dashboard(Event $event)` — GET returns Inertia page with real-time check-in stats

**Frontend — QR Scanner** (`resources/js/components/check-in/QRScanner.tsx`):
- Install `html5-qrcode` package: `npm install html5-qrcode`
- Component that activates camera, scans QR codes
- On successful scan, calls `POST /api/check-in/scan` with the ticket_code
- Shows green check (success) or red X (already used / invalid)
- Plays a subtle sound on success/failure

**Frontend — Scanner Page** (`resources/js/pages/event-city/check-ins/scanner.tsx`):
- Full-screen scanner view for venue staff
- Large camera viewfinder with QR scanner
- Recent check-ins list below
- Counter showing "X / Y checked in"

**Frontend — Dashboard Page** (`resources/js/pages/event-city/check-ins/dashboard.tsx`):
- For event organizers
- Real-time attendance count vs. tickets sold
- Check-in rate chart (check-ins over time)
- List of checked-in attendees
- Manual check-in button (search by name/email)

**Routes**:
```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/api/check-in/scan', [TicketCheckInController::class, 'scan'])->name('api.checkin.scan');
    Route::get('/events/{event}/check-in-dashboard', [TicketCheckInController::class, 'dashboard'])->name('events.checkin.dashboard');
    Route::get('/events/{event}/scanner', [TicketCheckInController::class, 'scannerPage'])->name('events.checkin.scanner');
});
```

---

## TASK 2.5: Event Reports for Organizers

**Dependencies**: Task 2.4 (check-in data)

**Creates**:
- `app/Services/EventReportService.php`
- `app/Http/Controllers/EventReportController.php`
- `resources/js/pages/event-city/dashboard/event-report.tsx`

**Implementation**:

**Service** — `app/Services/EventReportService.php`:
```php
final class EventReportService
{
    public function getEventReport(Event $event): array
    {
        return [
            'ticket_sales' => [
                'total_sold' => $event->ticketOrders()->sum('total_amount'),
                'total_tickets' => $event->ticketPlans->sum(fn($p) => $p->max_quantity - $p->available_quantity),
                'revenue' => $event->ticketOrders()->where('status', 'completed')->sum('total_amount'),
                'by_plan' => $event->ticketPlans->map(fn($p) => [
                    'name' => $p->name,
                    'sold' => $p->max_quantity - $p->available_quantity,
                    'total' => $p->max_quantity,
                    'revenue' => $p->orderItems()->sum(DB::raw('unit_price * quantity')),
                ]),
            ],
            'attendance' => [
                'checked_in' => $event->checkIns()->count(),
                'total_tickets' => $event->ticketPlans->sum(fn($p) => $p->max_quantity - $p->available_quantity),
                'rate' => // checked_in / total_tickets * 100
            ],
            'engagement' => [
                'views' => $event->engagements()->where('type', 'event_view')->count(),
                'saves' => $event->calendarEvents()->count(),
                'shares' => $event->shares()->count(),
                'follows' => $event->follows()->count(),
            ],
        ];
    }
}
```

**Frontend page**: Show report as a clean dashboard with stat cards + charts (use recharts or Chart.js — neither is currently installed, so use simple Tailwind stat cards first).

Add CSV export endpoint: `GET /events/{event}/report/export` returns CSV file.

---

# PHASE 3 — VERIFICATION, CHECK-IN EXPANSION, SHARING

---

## TASK 3.1: Owner Verification System

**Dependencies**: None

**Modifies**:
- `app/Http/Controllers/AlphaSite/ClaimController.php` — implement actual verification logic
- `app/Services/PhoneVerificationService.php` — wire into claim flow

**Creates**:
- `app/Services/BusinessVerificationService.php`
- `resources/js/pages/event-city/businesses/claim.tsx`
- `resources/js/pages/event-city/businesses/verify.tsx`

**Implementation**:

**Service** — `app/Services/BusinessVerificationService.php`:
```php
final class BusinessVerificationService
{
    public function __construct(
        private readonly PhoneVerificationService $phoneService
    ) {}

    public function sendPhoneVerification(Business $business): void
    {
        // Send OTP to the business phone on file
        $this->phoneService->sendVerificationCode($business->phone);
    }

    public function verifyPhone(Business $business, string $code): bool
    {
        $valid = $this->phoneService->verifyCode($business->phone, $code);
        if ($valid) {
            $business->update([
                'verification_status' => 'phone_verified',
                'is_verified' => true,
                'verified_at' => now(),
            ]);
        }
        return $valid;
    }

    public function sendEmailVerification(Business $business): void
    {
        // Send verification code to business email on file
        $code = random_int(100000, 999999);
        cache()->put("business_verify_email:{$business->id}", $code, now()->addMinutes(30));
        // Send email with code using Mail facade
    }

    public function verifyEmail(Business $business, string $code): bool
    {
        $storedCode = cache()->get("business_verify_email:{$business->id}");
        if ($storedCode && (string) $storedCode === $code) {
            $business->update([
                'verification_status' => 'email_verified',
                'is_verified' => true,
                'verified_at' => now(),
            ]);
            return true;
        }
        return false;
    }

    public function generateWebsiteMetaTag(Business $business): string
    {
        $token = hash('sha256', $business->id . config('app.key'));
        cache()->put("business_verify_web:{$business->id}", $token, now()->addDays(7));
        return "<meta name=\"goeventcity-verify\" content=\"{$token}\">";
    }

    public function verifyWebsite(Business $business): bool
    {
        $token = cache()->get("business_verify_web:{$business->id}");
        if (!$token || !$business->website) return false;

        try {
            $html = file_get_contents($business->website);
            if (str_contains($html, $token)) {
                $business->update([
                    'verification_status' => 'website_verified',
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);
                return true;
            }
        } catch (\Exception) {}
        return false;
    }
}
```

**Fix the ClaimController** — replace the TODO in `verify()` with actual calls to `BusinessVerificationService`.

**Frontend**: Multi-step verification wizard:
1. Choose method (phone, email, website)
2. Phone: enter OTP sent to business phone
3. Email: enter code sent to business email
4. Website: show meta tag to add, click "Verify" to trigger check

---

## TASK 3.2: Expanded Check-In (Venues + Performers)

**Dependencies**: Task 2.4 (ticket check-in system)

**Modifies**:
- `app/Models/CheckIn.php` — add polymorphic support
- `app/Http/Controllers/CheckInController.php` — accept venue_id and performer_id
- Existing check-in components: `resources/js/components/check-in/CheckInButton.tsx`, `CheckInModal.tsx`, `CheckInFeed.tsx`

**Creates**:
- `database/migrations/{timestamp}_add_polymorphic_to_check_ins.php`

**Implementation**:

Add migration to make check-ins polymorphic:
```php
Schema::table('check_ins', function (Blueprint $table) {
    $table->string('checkable_type')->default('App\\Models\\Event');
    $table->uuid('checkable_id')->nullable();
    $table->index(['checkable_type', 'checkable_id']);
});
// Backfill: UPDATE check_ins SET checkable_type = 'App\Models\Event', checkable_id = event_id WHERE event_id IS NOT NULL
```

Update `CheckIn` model to add `checkable()` morphTo relationship.

Update `CheckInController::store()` to accept `checkable_type` and `checkable_id` in addition to `event_id`.

Add proximity validation:
```php
if ($validated['latitude'] && $validated['longitude'] && $checkable instanceof Venue) {
    $distance = // Haversine between user lat/lng and venue lat/lng
    if ($distance > 0.5) { // 500 meters
        return response()->json(['error' => 'You must be within 500 meters of the venue to check in.'], 422);
    }
}
```

Wire `CheckInButton.tsx` into `venues/show.tsx` and `performers/show.tsx` pages. The component already exists (68 lines) — just import it and add to those pages.

Wire check-ins to `GamificationService` for points:
```php
app(GamificationService::class)->awardPoints($user, 'check_in', 10);
```

---

## TASK 3.3: Share Calendar + iCal Feed

**Dependencies**: Task 1.2 (AddToCalendar)

**Creates**:
- `app/Http/Controllers/Api/CalendarFeedController.php`
- `resources/js/components/calendars/ShareCalendarModal.tsx`

**Modifies**:
- `resources/js/pages/event-city/calendars/show.tsx` — add share button and editor management UI

**Implementation**:

**iCal Feed** — `CalendarFeedController`:
- `GET /calendars/{calendar}/feed.ics` — generates iCal feed for ALL events in a calendar
- This URL can be subscribed to in Google Calendar, Apple Calendar, Outlook
- Public calendars: no auth required. Private: requires signed URL

**Share Modal** — `ShareCalendarModal.tsx`:
- Copy shareable link
- Copy iCal subscription URL
- Invite friend by email (calls existing `CalendarController::addEditor`)
- Share to social media

Wire into `calendars/show.tsx` — add Share button in the header area.

Also add editor management UI in the calendar show page: list current editors, remove button, add editor form. The backend already exists (`addEditor`, `removeEditor` in CalendarController).

---

# PHASE 4 — SOCIAL LAYER

---

## TASK 4.1: Real-Time Location Sharing

**Dependencies**: All previous phases

**Creates**:
- `app/Models/LocationShare.php`
- `database/migrations/{timestamp}_create_location_shares_table.php`
- `app/Http/Controllers/LocationShareController.php`
- `app/Events/LocationUpdated.php`
- `resources/js/pages/event-city/social/location-map.tsx`
- `resources/js/components/social/FriendLocationPin.tsx`

**Implementation**:

**Migration** — `location_shares` table:
```php
$table->uuid('id')->primary();
$table->uuid('user_id');
$table->decimal('latitude', 10, 8);
$table->decimal('longitude', 11, 8);
$table->string('label')->nullable();        // "At the concert!", "Heading to venue"
$table->timestamp('expires_at');             // Time-limited sharing
$table->json('visible_to')->nullable();      // null = all friends, or array of user_ids
$table->timestamps();
$table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
```

**Controller** — `LocationShareController`:
- `startSharing(Request)` — create LocationShare with expiry (1hr, 2hr, until event ends)
- `updateLocation(Request)` — update lat/lng, broadcast event
- `stopSharing()` — delete record
- `getFriendLocations()` — get active shares from user's friends

**Broadcasting** — Use Laravel Broadcasting (Redis + Pusher/Soketi):
```php
class LocationUpdated implements ShouldBroadcast
{
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('friends.' . $this->userId);
    }
}
```

**Frontend** — Map page showing friend pins with real-time updates via Echo:
```tsx
import Echo from "laravel-echo";
// Listen for friend location updates
window.Echo.private(`friends.${userId}`).listen('LocationUpdated', (e) => {
    updateFriendPin(e.userId, e.latitude, e.longitude);
});
```

**Privacy controls**: Duration picker (1hr, 2hr, 4hr, until event ends), visibility picker (all friends, specific friends).

NOTE: This feature requires Laravel Echo and a WebSocket server (Pusher, Soketi, or similar). If not already configured, this may need infrastructure setup first. Check if broadcasting is configured in `config/broadcasting.php`.

---

# TESTING REQUIREMENTS

For each task, create the following test files:

## Backend Tests
- Location: `tests/Feature/` for each controller
- Location: `tests/Unit/` for each service
- Use `RefreshDatabase` trait
- Use existing factories (193 factories exist in `database/factories/`)

## Frontend Tests
- Manual verification checklist for each page
- Verify mobile responsiveness (Tailwind responsive classes)
- Test with both authenticated and unauthenticated users

## Integration Tests
- Ticket purchase → QR generation → check-in flow
- Share generation → click tracking → analytics
- Headliner purchase → display on discovery page

---

# ENVIRONMENT SETUP

Before starting, ensure:
```bash
cp .env.example .env
# Set these in .env:
# STRIPE_KEY=sk_test_...
# STRIPE_SECRET=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# DB_CONNECTION=pgsql
# REDIS_URL=redis://...

composer install
npm install
php artisan key:generate
php artisan migrate
npm run build
```

### Git Workflow
1. Create branch: `git checkout -b feature/events-system-v2`
2. Each TASK = one commit with descriptive message: `feat(events): implement inventory locking for ticket purchases`
3. Run `php artisan test` after each task
4. Run `npm run build` to verify no TypeScript errors
5. Push and create PR against `main` when phase is complete

---

# TASK DEPENDENCY GRAPH

```
PHASE 0 (all independent, do in parallel):
  0.1 Inventory Locking
  0.2 Foreign Keys
  0.3 Stripe Discounts
  0.4 Distance Sorting
  0.5 Amenities Filter
  0.6 Mock Data
  0.7 Price Range

PHASE 1 (after Phase 0):
  1.1 FollowButton ──────────┐
  1.2 AddToCalendar          │
  1.3 Performer Show ────────┤ (needs 1.1)
  1.4 My Tickets ────────────┤ (needs 0.1, 0.2)

PHASE 2 (after Phase 1):
  2.1 Share Event
  2.2 Headliner Tiers
  2.3 Event Discovery ───────┤ (needs 2.2)
  2.4 Ticket Check-In ───────┤ (needs 0.1, 0.2)
  2.5 Event Reports ─────────┤ (needs 2.4)

PHASE 3 (after Phase 2):
  3.1 Owner Verification
  3.2 Expanded Check-In ─────┤ (needs 2.4)
  3.3 Share Calendar ────────┤ (needs 1.2)

PHASE 4 (after Phase 3):
  4.1 Location Sharing
```

**For Cursor Agent spawning**: Phase 0 tasks (0.1-0.7) can all run as parallel agents. Phase 1 tasks can run 2-3 agents (1.1+1.2 parallel, then 1.3+1.4). Phase 2 onward should be mostly sequential due to dependencies.
