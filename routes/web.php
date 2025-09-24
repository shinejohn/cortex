<?php

declare(strict_types=1);

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\HomePageController;
use App\Http\Controllers\PerformerController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\SocialFeedController;
use App\Http\Controllers\SocialGroupController;
use App\Http\Controllers\SocialGroupPostController;
use App\Http\Controllers\SocialMessageController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', [HomePageController::class, 'index'])->name('home');
Route::get('/events', [EventController::class, 'publicIndex'])->name('events');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show')->can('view', 'event');
Route::get('/performers', [PerformerController::class, 'publicIndex'])->name('performers');
Route::get('/performers/{performer}', [PerformerController::class, 'show'])->name('performers.show')->can('view', 'performer');
Route::get('/venues', [VenueController::class, 'publicIndex'])->name('venues');
Route::get('/venues/{venue}', [VenueController::class, 'show'])->name('venues.show')->can('view', 'venue');

// Community routes (publicly accessible)
Route::get('/community', [CommunityController::class, 'index'])->name('community.index');
Route::get('/community/impact', function () {
    return Inertia::render('Community/Impact');
})->name('community.impact');
Route::get('/community/{id}', [CommunityController::class, 'show'])->name('community.show');
Route::get('/community/{id}/thread/{threadId}', [CommunityController::class, 'showThread'])->name('community.thread.show');

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
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Resource routes for CRUD operations (excluding index and show for events/performers/venues since they have public versions)
    Route::resource('venues', VenueController::class)->except(['index', 'show']);
    Route::resource('performers', PerformerController::class)->except(['index', 'show']);
    Route::resource('events', EventController::class)->except(['index', 'show']);
    Route::resource('bookings', BookingController::class);

    // Community thread management routes (require authentication)
    Route::get('/community/{id}/new-thread', [CommunityController::class, 'createThread'])->name('community.thread.create');
    Route::post('/community/{id}/threads', [CommunityController::class, 'storeThread'])->name('community.thread.store');

    // Community thread reply routes (require authentication)
    Route::post('/community/thread/{threadId}/replies', [CommunityController::class, 'storeReply'])->name('community.thread.reply.store');
    Route::patch('/community/reply/{replyId}', [CommunityController::class, 'updateReply'])->name('community.reply.update');
    Route::delete('/community/reply/{replyId}', [CommunityController::class, 'destroyReply'])->name('community.reply.destroy');
    Route::post('/community/reply/{replyId}/like', [CommunityController::class, 'likeReply'])->name('community.reply.like');

    // Admin routes for events, performers, and venues management
    Route::get('/admin/events', [EventController::class, 'index'])->name('admin.events.index');
    Route::get('/admin/performers', [PerformerController::class, 'index'])->name('admin.performers.index');
    Route::get('/admin/venues', [VenueController::class, 'index'])->name('admin.venues.index');

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
});

require __DIR__.'/workspace.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
