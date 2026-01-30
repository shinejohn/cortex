<?php

declare(strict_types=1);

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\EventCity\SitemapController as EventCitySitemapController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomePageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PerformerController;
use App\Http\Controllers\Social\ImageUploadController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\SocialFeedController;
use App\Http\Controllers\SocialGroupController;
use App\Http\Controllers\SocialGroupPostController;
use App\Http\Controllers\SocialMessageController;
use App\Http\Controllers\TicketOrderController;
use App\Http\Controllers\TicketPageController;
use App\Http\Controllers\TicketPlanController;
use App\Http\Controllers\VenueController;
use App\Http\Controllers\HubController;
use App\Http\Controllers\HubBuilderController;
use App\Http\Controllers\HubAnalyticsController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\TicketMarketplaceController;
use App\Http\Controllers\TicketTransferController;
use App\Http\Controllers\TicketGiftController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Sitemap routes
Route::get('/robots.txt', [EventCitySitemapController::class, 'robots']);
Route::get('/sitemap.xml', [EventCitySitemapController::class, 'index']);
Route::get('/sitemap-static.xml', [EventCitySitemapController::class, 'static']);
Route::get('/sitemap-events.xml', [EventCitySitemapController::class, 'events']);
Route::get('/sitemap-events-{page}.xml', [EventCitySitemapController::class, 'events'])->where('page', '[0-9]+');
Route::get('/sitemap-venues.xml', [EventCitySitemapController::class, 'venues']);
Route::get('/sitemap-venues-{page}.xml', [EventCitySitemapController::class, 'venues'])->where('page', '[0-9]+');
Route::get('/sitemap-performers.xml', [EventCitySitemapController::class, 'performers']);
Route::get('/sitemap-performers-{page}.xml', [EventCitySitemapController::class, 'performers'])->where('page', '[0-9]+');
Route::get('/sitemap-calendars.xml', [EventCitySitemapController::class, 'calendars']);
Route::get('/sitemap-community.xml', [EventCitySitemapController::class, 'community']);

// Public routes
Route::get('/', [HomePageController::class, 'index'])->name('home');

// Marketing pages
Route::get('/about', function () {
    return Inertia::render('event-city/about');
})->name('about');
Route::get('/contact', function () {
    return Inertia::render('event-city/contact');
})->name('contact');
Route::get('/how-it-works', function () {
    return Inertia::render('event-city/how-it-works');
})->name('how-it-works');
Route::get('/success-stories', function () {
    return Inertia::render('event-city/marketing/success-stories', [
        'stories' => [],
    ]);
})->name('success-stories');
Route::get('/advertise', function () {
    return Inertia::render('event-city/marketing/advertise');
})->name('advertise');
Route::get('/partner', function () {
    return Inertia::render('event-city/marketing/partner');
})->name('partner');
Route::get('/press', function () {
    return Inertia::render('event-city/marketing/press', [
        'pressReleases' => [],
        'mediaContacts' => [],
    ]);
})->name('press');
Route::get('/careers', function () {
    return Inertia::render('event-city/marketing/careers', [
        'jobs' => [],
    ]);
})->name('careers');
Route::get('/gear', function () {
    return Inertia::render('event-city/marketing/gear', [
        'products' => [],
        'categories' => [],
    ]);
})->name('gear');
Route::get('/calendar', [CalendarController::class, 'publicIndex'])->name('calendar.index');

// Create routes must come before {id} routes to avoid conflicts
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
    Route::get('/performers/create', [PerformerController::class, 'create'])->name('performers.create');
    Route::get('/venues/create', [VenueController::class, 'create'])->name('venues.create');
    Route::get('/calendars/create', [CalendarController::class, 'create'])->name('calendars.create');
});

Route::get('/events', [EventController::class, 'publicIndex'])->name('events');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show')->can('view', 'event');
Route::get('/performers', [PerformerController::class, 'publicIndex'])->name('performers');
Route::get('/performers/discovery', function () {
    return Inertia::render('event-city/performers/discovery', [
        'performers' => [],
        'filters' => [],
    ]);
})->name('performers.discovery');
Route::get('/performers/market-report', function () {
    return Inertia::render('event-city/performers/market-report', [
        'marketData' => [],
        'locations' => [],
        'genres' => [],
    ]);
})->name('performers.market-report');
Route::get('/performers/{performer}', [PerformerController::class, 'show'])->name('performers.show')->can('view', 'performer');
Route::get('/venues', [VenueController::class, 'publicIndex'])->name('venues');
Route::get('/venues/submit', function () {
    return Inertia::render('event-city/venues/submit');
})->name('venues.submit');
Route::get('/venues/{venue}', [VenueController::class, 'show'])->name('venues.show')->can('view', 'venue');

// EventCity Business Directory (unique from venues - shows all businesses with event focus)
Route::get('/businesses', [\App\Http\Controllers\EventCity\BusinessController::class, 'index'])->name('event-city.businesses.index');
Route::get('/businesses/{business:slug}', [\App\Http\Controllers\EventCity\BusinessController::class, 'show'])->name('event-city.businesses.show');

// Calendar routes
Route::get('/calendars', [CalendarController::class, 'index'])->name('calendars.index');
// Add any non-numeric calendar routes here (e.g., /calendars/marketplace, /calendars/trending, etc.)
// Route::get('/calendars/marketplace', [CalendarController::class, 'marketplace'])->name('calendars.marketplace');
Route::get('/calendars/{calendar}', [CalendarController::class, 'show'])->name('calendars.show')->can('view', 'calendar');

// Ticket routes
Route::get('/tickets', [TicketPageController::class, 'index'])->name('tickets.index');
Route::get('/events/{event}/tickets', [TicketPageController::class, 'selection'])->name('events.tickets.selection');

// Community routes (publicly accessible)
Route::get('/community', [CommunityController::class, 'index'])->name('community.index');
Route::get('/community/impact', function () {
    return Inertia::render('event-city/community/impact');
})->name('community.impact');
Route::get('/community/{id}', [CommunityController::class, 'show'])->name('community.show');
Route::get('/community/{id}/thread/{threadId}', [CommunityController::class, 'showThread'])->name('community.thread.show');

// Location API routes (public, rate-limited)
Route::prefix('api/location')->group(function () {
    // Search endpoint - higher limit for autocomplete
    Route::get('/search', [App\Http\Controllers\Api\LocationController::class, 'search'])
        ->middleware('throttle:location-search');

    // Action endpoints - lower limit to prevent abuse
    Route::middleware('throttle:location-actions')->group(function () {
        Route::post('/detect-browser', [App\Http\Controllers\Api\LocationController::class, 'detectFromBrowser']);
        Route::post('/set-region', [App\Http\Controllers\Api\LocationController::class, 'setRegion']);
        Route::post('/clear', [App\Http\Controllers\Api\LocationController::class, 'clear']);
    });
});

// API routes for frontend data
Route::middleware(['auth'])->group(function () {
    Route::get('/api/events/featured', [EventController::class, 'featured'])->name('api.events.featured');
    Route::get('/api/events/upcoming', [EventController::class, 'upcoming'])->name('api.events.upcoming');
    Route::get('/api/venues/featured', [VenueController::class, 'featured'])->name('api.venues.featured');
    Route::get('/api/performers/featured', [PerformerController::class, 'featured'])->name('api.performers.featured');
    Route::get('/api/performers/trending', [PerformerController::class, 'trending'])->name('api.performers.trending');

    // Engagement tracking API routes
    Route::post('/api/engagement/track', [App\Http\Controllers\EngagementController::class, 'track'])->name('api.engagement.track');
    Route::post('/api/engagement/session/start', [App\Http\Controllers\EngagementController::class, 'sessionStart'])->name('api.engagement.session.start');
    Route::post('/api/engagement/session/end', [App\Http\Controllers\EngagementController::class, 'sessionEnd'])->name('api.engagement.session.end');

    // Notification API routes
    Route::get('/api/notifications/unread', [NotificationController::class, 'getUnread'])->name('api.notifications.unread');
    Route::patch('/api/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('api.notifications.read');
    Route::patch('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-read');

    // Ticket API routes
    Route::get('/api/ticket-plans', [TicketPlanController::class, 'index'])->name('api.ticket-plans.index');
    Route::get('/api/events/{event}/ticket-plans', [TicketPlanController::class, 'forEvent'])->name('api.events.ticket-plans');
    Route::resource('/api/ticket-orders', TicketOrderController::class, ['as' => 'api']);

    // Follow API routes
    Route::post('/api/follow/toggle', [FollowController::class, 'toggle'])->name('api.follow.toggle');
    Route::get('/api/follow/status', [FollowController::class, 'checkStatus'])->name('api.follow.status');
});

// N8N Integration API routes (protected with API key authentication)
Route::prefix('api/n8n')->name('api.n8n.')->middleware('n8n.api')->group(function () {
    Route::get('/regions', [App\Http\Controllers\Api\N8nIntegrationController::class, 'getRegions'])->name('regions');
    Route::post('/businesses', [App\Http\Controllers\Api\N8nIntegrationController::class, 'upsertBusiness'])->name('businesses.upsert');
    Route::get('/businesses/{business}/feeds', [App\Http\Controllers\Api\N8nIntegrationController::class, 'getBusinessFeeds'])->name('businesses.feeds');
    Route::post('/feeds', [App\Http\Controllers\Api\N8nIntegrationController::class, 'upsertFeed'])->name('feeds.upsert');
    Route::get('/feeds', [App\Http\Controllers\Api\N8nIntegrationController::class, 'getAllFeeds'])->name('feeds.all');
    Route::patch('/feeds/{feed}/health', [App\Http\Controllers\Api\N8nIntegrationController::class, 'updateFeedHealth'])->name('feeds.health');
    Route::post('/articles', [App\Http\Controllers\Api\N8nIntegrationController::class, 'publishArticle'])->name('articles.publish');
    Route::patch('/articles/{article}/status', [App\Http\Controllers\Api\N8nIntegrationController::class, 'updateArticleStatus'])->name('articles.status');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Resource routes for CRUD operations (excluding index, show, and create since they're defined elsewhere)
    Route::resource('venues', VenueController::class)->except(['index', 'show', 'create']);
    Route::resource('performers', PerformerController::class)->except(['index', 'show', 'create']);
    Route::resource('events', EventController::class)->except(['index', 'show', 'create']);
    Route::resource('calendars', CalendarController::class)->except(['index', 'show', 'create']);
    Route::resource('bookings', BookingController::class);

    // Calendar management routes
    Route::post('/calendars/{calendar}/follow', [CalendarController::class, 'follow'])->name('calendars.follow');
    Route::post('/calendars/{calendar}/events', [CalendarController::class, 'addEvent'])->name('calendars.events.add');
    Route::delete('/calendars/{calendar}/events/{event}', [CalendarController::class, 'removeEvent'])->name('calendars.events.remove');
    Route::post('/calendars/{calendar}/editors', [CalendarController::class, 'addEditor'])->name('calendars.editors.add');
    Route::delete('/calendars/{calendar}/editors/{user}', [CalendarController::class, 'removeEditor'])->name('calendars.editors.remove');

    // Ticket management routes
    Route::resource('ticket-plans', TicketPlanController::class);
    Route::resource('ticket-orders', TicketOrderController::class);

    // Authenticated ticket routes
    Route::get('/tickets/my-tickets', [TicketPageController::class, 'myTickets'])->name('tickets.my-tickets');
    Route::get('/tickets/checkout/success/{ticketOrder}', [TicketOrderController::class, 'checkoutSuccess'])->name('tickets.checkout.success');
    Route::get('/tickets/checkout/cancel/{ticketOrder}', [TicketOrderController::class, 'checkoutCancel'])->name('tickets.checkout.cancel');

    // Public ticket verification route
    Route::get('/tickets/verify/{ticketCode}', [TicketPageController::class, 'verifyTicket'])->name('tickets.verify')->withoutMiddleware(['auth', 'verified']);

    // Hub routes
    Route::resource('hubs', HubController::class)->except(['show']);
    Route::get('/hubs/{hub:slug}', [HubController::class, 'show'])->name('hubs.show')->withoutMiddleware(['auth', 'verified']);
    Route::get('/hubs/{hub}/builder', [HubBuilderController::class, 'show'])->name('hubs.builder');
    Route::post('/hubs/{hub}/builder/design', [HubBuilderController::class, 'updateDesign'])->name('hubs.builder.design');
    Route::post('/hubs/{hub}/builder/sections', [HubBuilderController::class, 'updateSections'])->name('hubs.builder.sections');
    Route::delete('/hubs/{hub}/builder/sections/{section}', [HubBuilderController::class, 'deleteSection'])->name('hubs.builder.sections.delete');
    Route::get('/hubs/{hub}/preview', [HubBuilderController::class, 'preview'])->name('hubs.preview');
    Route::post('/hubs/{hub}/publish', [HubBuilderController::class, 'publish'])->name('hubs.publish');
    Route::get('/hubs/{hub}/analytics', [HubAnalyticsController::class, 'index'])->name('hubs.analytics');
    Route::get('/api/hubs/{hub}/analytics/stats', [HubAnalyticsController::class, 'getStats'])->name('api.hubs.analytics.stats');
    Route::post('/api/hubs/{hub}/analytics/track-view', [HubAnalyticsController::class, 'trackPageView'])->name('api.hubs.analytics.track-view');
    Route::post('/api/hubs/{hub}/analytics/track-visitor', [HubAnalyticsController::class, 'trackVisitor'])->name('api.hubs.analytics.track-visitor');

    // Check-in routes
    Route::resource('check-ins', CheckInController::class)->except(['create', 'edit']);
    Route::post('/api/events/{event}/check-in', [CheckInController::class, 'store'])->name('api.events.check-in');
    Route::get('/api/events/{event}/check-ins', [CheckInController::class, 'forEvent'])->name('api.events.check-ins');

    // Planned events routes
    Route::post('/api/events/{event}/plan', function (Request $request, Event $event) {
        $plannedEvent = PlannedEvent::firstOrCreate([
            'event_id' => $event->id,
            'user_id' => $request->user()->id,
        ], [
            'planned_at' => now(),
        ]);
        return response()->json($plannedEvent);
    })->name('api.events.plan');
    Route::delete('/api/events/{event}/unplan', function (Request $request, Event $event) {
        PlannedEvent::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->delete();
        return response()->json(['success' => true]);
    })->name('api.events.unplan');

    // Promo code routes
    Route::resource('promo-codes', PromoCodeController::class);
    Route::post('/api/promo-codes/validate', [PromoCodeController::class, 'validate'])->name('api.promo-codes.validate');

    // Ticket marketplace routes
    Route::get('/tickets/marketplace', [TicketMarketplaceController::class, 'index'])->name('tickets.marketplace.index')->withoutMiddleware(['auth', 'verified']);
    Route::get('/tickets/list-for-sale', [TicketMarketplaceController::class, 'create'])->name('tickets.marketplace.create');
    Route::post('/tickets/list-for-sale', [TicketMarketplaceController::class, 'store'])->name('tickets.marketplace.store');
    Route::get('/tickets/marketplace/{listing}', [TicketMarketplaceController::class, 'show'])->name('tickets.marketplace.show')->withoutMiddleware(['auth', 'verified']);
    Route::post('/tickets/marketplace/{listing}/purchase', [TicketMarketplaceController::class, 'purchase'])->name('tickets.marketplace.purchase');
    Route::delete('/tickets/marketplace/{listing}', [TicketMarketplaceController::class, 'destroy'])->name('tickets.marketplace.destroy');

    // Ticket transfer routes
    Route::get('/tickets/transfer/{ticketOrderItem}', [TicketTransferController::class, 'create'])->name('tickets.transfer.create');
    Route::post('/tickets/transfer/{ticketOrderItem}', [TicketTransferController::class, 'store'])->name('tickets.transfer.store');
    Route::get('/tickets/transfer/accept/{token}', [TicketTransferController::class, 'accept'])->name('tickets.transfer.accept')->withoutMiddleware(['auth', 'verified']);
    Route::post('/tickets/transfer/{transfer}/complete', [TicketTransferController::class, 'complete'])->name('tickets.transfer.complete');
    Route::post('/tickets/transfer/{transfer}/cancel', [TicketTransferController::class, 'cancel'])->name('tickets.transfer.cancel');

    // Ticket gift routes
    Route::get('/tickets/gift/{ticketOrderItem}', [TicketGiftController::class, 'create'])->name('tickets.gift.create');
    Route::post('/tickets/gift/{ticketOrderItem}', [TicketGiftController::class, 'store'])->name('tickets.gift.store');
    Route::get('/tickets/gift/redeem/{token}', [TicketGiftController::class, 'redeem'])->name('tickets.gift.redeem')->withoutMiddleware(['auth', 'verified']);
    Route::post('/tickets/gift/{gift}/complete', [TicketGiftController::class, 'complete'])->name('tickets.gift.complete');
    Route::post('/tickets/gift/{gift}/cancel', [TicketGiftController::class, 'cancel'])->name('tickets.gift.cancel');

    // Dashboard routes
    Route::get('/dashboard', function (Request $request) {
        // Redirect to appropriate dashboard based on user role or default to fan dashboard
        return redirect()->route('dashboard.fan');
    })->name('dashboard');

    Route::get('/dashboard/fan', function (Request $request) {
        return Inertia::render('event-city/dashboard/fan', [
            'user' => $request->user(),
            'upcomingEvents' => [],
            'pastEvents' => [],
            'plannedEvents' => [],
            'stats' => [
                'total_events_attended' => 0,
                'upcoming_events' => 0,
                'total_spent' => 0,
                'favorite_performers' => 0,
            ],
        ]);
    })->name('dashboard.fan');
    Route::get('/dashboard/organizer', function (Request $request) {
        return Inertia::render('event-city/dashboard/organizer', [
            'events' => [],
            'stats' => [
                'total_events' => 0,
                'upcoming_events' => 0,
                'total_revenue' => 0,
                'total_attendees' => 0,
                'ticket_sales' => 0,
            ],
        ]);
    })->name('dashboard.organizer');
    Route::get('/dashboard/performer', function (Request $request) {
        return Inertia::render('event-city/dashboard/performer', [
            'performer' => [],
            'upcomingGigs' => [],
            'pastGigs' => [],
            'stats' => [
                'total_gigs' => 0,
                'total_revenue' => 0,
                'average_rating' => 0,
                'upcoming_shows' => 0,
            ],
        ]);
    })->name('dashboard.performer');
    Route::get('/dashboard/venue-owner', function (Request $request) {
        return Inertia::render('event-city/dashboard/venue-owner', [
            'venues' => [],
            'upcomingBookings' => [],
            'stats' => [
                'total_venues' => 0,
                'total_bookings' => 0,
                'total_revenue' => 0,
                'upcoming_bookings' => 0,
            ],
        ]);
    })->name('dashboard.venue-owner');
    Route::get('/dashboard/calendar', function (Request $request) {
        return Inertia::render('event-city/dashboard/calendar', [
            'events' => [],
            'currentDate' => now()->toDateString(),
        ]);
    })->name('dashboard.calendar');

    // Community thread management routes (require authentication)
    Route::get('/community/{id}/new-thread', [CommunityController::class, 'createThread'])->name('community.thread.create');
    Route::post('/community/{id}/threads', [CommunityController::class, 'storeThread'])->name('community.thread.store');

    // Community thread reply routes (require authentication)
    Route::post('/community/thread/{threadId}/replies', [CommunityController::class, 'storeReply'])->name('community.thread.reply.store');
    Route::patch('/community/reply/{replyId}', [CommunityController::class, 'updateReply'])->name('community.reply.update');
    Route::delete('/community/reply/{replyId}', [CommunityController::class, 'destroyReply'])->name('community.reply.destroy');
    Route::post('/community/reply/{replyId}/like', [CommunityController::class, 'likeReply'])->name('community.reply.like');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // Additional booking actions
    Route::patch('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // Social media routes
    Route::prefix('social')->name('social.')->group(function () {
        // Social feed and posts
        Route::get('/', [SocialController::class, 'index'])->name('index');

        // Feed algorithms
        Route::get('/feed', [SocialFeedController::class, 'index'])->name('feed.index');
        Route::get('/feed/for-you', [SocialFeedController::class, 'forYou'])->name('feed.for-you');
        Route::get('/feed/followed', [SocialFeedController::class, 'followed'])->name('feed.followed');

        Route::post('/posts', [SocialController::class, 'createPost'])->name('posts.create');
        Route::post('/images/upload', [ImageUploadController::class, 'upload'])->name('images.upload');
        Route::post('/posts/{post}/like', [SocialController::class, 'likePost'])->name('posts.like');
        Route::delete('/posts/{post}/like', [SocialController::class, 'unlikePost'])->name('posts.unlike');
        Route::post('/posts/{post}/comments', [SocialController::class, 'createComment'])->name('posts.comments.create');
        Route::delete('/comments/{comment}', [SocialController::class, 'deleteComment'])->name('comments.delete');

        // Friend management
        Route::post('/users/{user}/friend-request', [SocialController::class, 'sendFriendRequest'])->name('friend.request');
        Route::patch('/friendships/{friendship}/accept', [SocialController::class, 'acceptFriendRequest'])->name('friend.accept');

        // User profiles
        Route::get('/profile/{user}', [SocialController::class, 'profile'])->name('profile');
        Route::patch('/profile', [SocialController::class, 'updateProfile'])->name('profile.update');

        // Activity feed/notifications
        Route::get('/activities', [SocialController::class, 'activities'])->name('activities');
        Route::patch('/activities/read', [SocialController::class, 'markActivitiesAsRead'])->name('activities.read');

        // Friends management
        Route::prefix('friends')->name('friends.')->group(function () {
            Route::get('/', [SocialController::class, 'friendsIndex'])->name('index');
            Route::patch('/{user}/accept', [SocialController::class, 'acceptFriendRequest'])->name('accept');
            Route::delete('/{user}/decline', [SocialController::class, 'declineFriendRequest'])->name('decline');
            Route::delete('/{user}/cancel', [SocialController::class, 'cancelFriendRequest'])->name('cancel');
            Route::delete('/{user}/remove', [SocialController::class, 'removeFriend'])->name('remove');
        });

        // Messages
        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [SocialMessageController::class, 'index'])->name('index');
            Route::get('/new', [SocialMessageController::class, 'newMessage'])->name('new');
            Route::post('/start', [SocialMessageController::class, 'startConversation'])->name('start');
            Route::get('/{conversation}', [SocialMessageController::class, 'show'])->name('show');
            Route::post('/{conversation}', [SocialMessageController::class, 'sendMessage'])->name('send');
        });

        // Groups
        Route::prefix('groups')->name('groups.')->group(function () {
            Route::get('/', [SocialGroupController::class, 'index'])->name('index');
            Route::get('/create', [SocialGroupController::class, 'create'])->name('create');
            Route::post('/', [SocialGroupController::class, 'store'])->name('store');
            Route::get('/{group}', [SocialGroupController::class, 'show'])->name('show');
            Route::post('/{group}/join', [SocialGroupController::class, 'join'])->name('join');
            Route::delete('/{group}/leave', [SocialGroupController::class, 'leave'])->name('leave');

            // Group invitations
            Route::post('/{group}/invite', [SocialGroupController::class, 'invite'])->name('invite');
            Route::patch('/invitations/{invitation}/respond', [SocialGroupController::class, 'respondToInvitation'])->name('invitations.respond');
            Route::get('/search-users', [SocialGroupController::class, 'searchUsers'])->name('search.users');

            // Group posts
            Route::get('/{group}/posts', [SocialGroupPostController::class, 'index'])->name('posts.index');
            Route::post('/{group}/posts', [SocialGroupPostController::class, 'store'])->name('posts.store');
            Route::get('/{group}/posts/{post}', [SocialGroupPostController::class, 'show'])->name('posts.show');
            Route::patch('/{group}/posts/{post}', [SocialGroupPostController::class, 'update'])->name('posts.update');
            Route::delete('/{group}/posts/{post}', [SocialGroupPostController::class, 'destroy'])->name('posts.destroy');
            Route::patch('/{group}/posts/{post}/pin', [SocialGroupPostController::class, 'pin'])->name('posts.pin');
        });
    });

    // Ecommerce routes
    Route::get('/shop', [App\Http\Controllers\ProductController::class, 'discover'])->name('shop.discover')->withoutMiddleware(['auth', 'verified']);

    Route::prefix('stores')->name('stores.')->group(function () {
        // Public store list
        Route::get('/', [App\Http\Controllers\StoreController::class, 'index'])->name('index')->withoutMiddleware(['auth', 'verified']);

        // Authenticated store management (must come before /{slug} route)
        Route::get('/my-stores', [App\Http\Controllers\StoreController::class, 'myStores'])->name('my-stores');
        Route::get('/create', [App\Http\Controllers\StoreController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\StoreController::class, 'store'])->name('store');

        // Public store show (must come after specific routes) - uses slug for SEO-friendly URLs
        Route::get('/{slug}', [App\Http\Controllers\StoreController::class, 'show'])->name('show')->withoutMiddleware(['auth', 'verified']);

        // Store management routes with store ID parameter
        Route::get('/{store:id}/edit', [App\Http\Controllers\StoreController::class, 'edit'])->name('edit');
        Route::patch('/{store:id}', [App\Http\Controllers\StoreController::class, 'update'])->name('update');

        // Stripe Connect routes - use ID for authenticated operations
        Route::match(['get', 'post'], '/{store:id}/connect-stripe', [App\Http\Controllers\StoreController::class, 'connectStripe'])->name('connect-stripe');
        Route::get('/{store:id}/connect-return', [App\Http\Controllers\StoreController::class, 'connectReturn'])->name('connect-return')->withoutMiddleware(['auth', 'verified']);
        Route::get('/{store:id}/connect-refresh', [App\Http\Controllers\StoreController::class, 'connectRefresh'])->name('connect-refresh')->withoutMiddleware(['auth', 'verified']);
        Route::get('/{store:id}/stripe-dashboard', [App\Http\Controllers\StoreController::class, 'stripeDashboard'])->name('stripe-dashboard');
    });

    // Product routes - using store ID for authenticated routes
    Route::prefix('stores/{store:id}')->name('products.')->group(function () {
        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/products/create', [App\Http\Controllers\ProductController::class, 'create'])->name('create');
            Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('store');
        });

        Route::get('/products/{product:id}', [App\Http\Controllers\ProductController::class, 'show'])->name('show')->withoutMiddleware(['auth', 'verified']);

        Route::middleware(['auth', 'verified'])->group(function () {
            Route::get('/products/{product:id}/edit', [App\Http\Controllers\ProductController::class, 'edit'])->name('edit');
            Route::patch('/products/{product:id}', [App\Http\Controllers\ProductController::class, 'update'])->name('update');
            Route::delete('/products/{product:id}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('destroy');
        });
    });

    // Order routes
    Route::prefix('orders')->name('orders.')->middleware(['auth', 'verified'])->group(function () {
        Route::get('/', [App\Http\Controllers\OrderController::class, 'index'])->name('index');
        Route::get('/{order}', [App\Http\Controllers\OrderController::class, 'show'])->name('show');
        Route::patch('/{order}/status', [App\Http\Controllers\OrderController::class, 'updateStatus'])->name('update-status');
    });

    // Checkout routes
    Route::post('/checkout', [App\Http\Controllers\OrderController::class, 'checkout'])->name('checkout');
    Route::get('/checkout/success/{order}', [App\Http\Controllers\OrderController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/cancel/{order}', [App\Http\Controllers\OrderController::class, 'cancel'])->name('checkout.cancel');

    // Cart routes
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [App\Http\Controllers\CartController::class, 'index'])->name('index')->withoutMiddleware(['auth', 'verified']);
        Route::post('/add', [App\Http\Controllers\CartController::class, 'add'])->name('add')->withoutMiddleware(['auth', 'verified']);
        Route::patch('/{cartItem}', [App\Http\Controllers\CartController::class, 'update'])->name('update')->withoutMiddleware(['auth', 'verified']);
        Route::delete('/{cartItem}', [App\Http\Controllers\CartController::class, 'remove'])->name('remove')->withoutMiddleware(['auth', 'verified']);
        Route::delete('/', [App\Http\Controllers\CartController::class, 'clear'])->name('clear')->withoutMiddleware(['auth', 'verified']);
        Route::get('/count', [App\Http\Controllers\CartController::class, 'count'])->name('count')->withoutMiddleware(['auth', 'verified']);
    });

    // Cart API routes
    Route::get('/api/cart/items', [App\Http\Controllers\CartController::class, 'items'])->withoutMiddleware(['auth', 'verified']);
});

// Stripe webhook (public route, no auth/CSRF)
Route::post('/stripe/webhook', App\Http\Controllers\StripeWebhookController::class)->name('stripe.webhook');

require __DIR__ . '/workspace.php';
require __DIR__ . '/settings.php';
// Public Poll Routes
Route::get('/poll/{slug}', [App\Http\Controllers\PollPageController::class, 'show'])->name('poll.show');
Route::get('/poll/{slug}/embed', [App\Http\Controllers\PollPageController::class, 'embed'])->name('poll.embed');
Route::post('/api/polls/{slug}/vote', [App\Http\Controllers\PollPageController::class, 'vote'])->name('poll.vote');

require __DIR__ . '/auth.php';
require __DIR__ . '/email-tracking.php';
require __DIR__ . '/admin.php';
