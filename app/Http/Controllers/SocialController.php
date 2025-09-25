<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Social\CreateCommentRequest;
use App\Http\Requests\Social\CreatePostRequest;
use App\Http\Requests\Social\UpdateProfileRequest;
use App\Models\SocialActivity;
use App\Models\SocialFriendship;
use App\Models\SocialPost;
use App\Models\SocialPostComment;
use App\Models\SocialPostLike;
use App\Models\SocialUserProfile;
use App\Models\User;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Log;

final class SocialController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // Load posts with proper relationships and counts
        $posts = SocialPost::with(['user', 'likes.user', 'comments.user'])
            ->where('is_active', true)
            ->where(function ($query) use ($user) {
                $query->where('visibility', 'public')
                    ->orWhere('user_id', $user->id)
                    ->orWhere(function ($q) use ($user) {
                        $q->where('visibility', 'friends')
                            ->whereHas('user.friendships', function ($friendQuery) use ($user) {
                                $friendQuery->where(function ($subQuery) use ($user) {
                                    $subQuery->where('user_id', $user->id)
                                        ->orWhere('friend_id', $user->id);
                                })->where('status', 'accepted');
                            });
                    });
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($post) use ($user) {
                return [
                    ...$post->toArray(),
                    'likes_count' => $post->likesCount(),
                    'comments_count' => $post->commentsCount(),
                    'shares_count' => $post->sharesCount(),
                    'is_liked_by_user' => $post->isLikedBy($user),
                    'recent_comments' => $post->comments()->with('user')->latest()->limit(3)->get(),
                ];
            });

        $userProfile = $user->socialProfile ?: new SocialUserProfile(['user_id' => $user->id]);

        // Get suggested friends (users not already friends with)
        $suggestedFriends = User::whereNotIn('id', function ($query) use ($user) {
            $query->select('friend_id')
                ->from('social_friendships')
                ->where('user_id', $user->id);
        })
            ->whereNotIn('id', function ($query) use ($user) {
                $query->select('user_id')
                    ->from('social_friendships')
                    ->where('friend_id', $user->id);
            })
            ->where('id', '!=', $user->id)
            ->limit(5)
            ->get();

        return Inertia::render('social/index', [
            'posts' => $posts,
            'user_profile' => $userProfile,
            'suggested_friends' => $suggestedFriends,
        ]);
    }

    public function createPost(CreatePostRequest $request): JsonResponse
    {
        $user = Auth::user();

        $post = SocialPost::create([
            'user_id' => $user->id,
            'content' => $request->content,
            'media' => $request->media,
            'visibility' => $request->visibility,
            'location' => $request->location,
        ]);

        $post->load(['user', 'likes.user', 'comments.user']);

        return response()->json([
            'post' => [
                ...$post->toArray(),
                'likes_count' => 0,
                'comments_count' => 0,
                'shares_count' => 0,
                'is_liked_by_user' => false,
            ],
        ]);
    }

    public function likePost(string $post): JsonResponse
    {
        $user = Auth::user();
        $socialPost = SocialPost::findOrFail($post);

        $like = SocialPostLike::firstOrCreate([
            'post_id' => $socialPost->id,
            'user_id' => $user->id,
        ]);

        // Create activity notification
        if ($socialPost->user_id !== $user->id) {
            SocialActivity::create([
                'user_id' => $socialPost->user_id,
                'actor_id' => $user->id,
                'type' => 'post_like',
                'subject_type' => SocialPost::class,
                'subject_id' => $socialPost->id,
            ]);
        }

        return response()->json([
            'liked' => true,
            'likes_count' => $socialPost->likesCount(),
        ]);
    }

    public function unlikePost(string $post): JsonResponse
    {
        $user = Auth::user();
        $socialPost = SocialPost::findOrFail($post);

        SocialPostLike::where('post_id', $socialPost->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([
            'liked' => false,
            'likes_count' => $socialPost->likesCount(),
        ]);
    }

    public function createComment(CreateCommentRequest $request, string $post): JsonResponse
    {
        $user = Auth::user();

        // Find the post manually since route model binding isn't working with UUIDs
        $socialPost = SocialPost::findOrFail($post);

        $comment = SocialPostComment::create([
            'post_id' => $socialPost->id,
            'user_id' => $user->id,
            'parent_id' => $request->parent_id,
            'content' => $request->content,
        ]);

        $comment->load('user');

        // Create activity notification
        if ($socialPost->user_id !== $user->id) {
            SocialActivity::create([
                'user_id' => $socialPost->user_id,
                'actor_id' => $user->id,
                'type' => 'post_comment',
                'subject_type' => SocialPost::class,
                'subject_id' => $socialPost->id,
            ]);
        }

        return response()->json([
            'comment' => [
                ...$comment->toArray(),
                'likes_count' => 0,
                'is_liked_by_user' => false,
                'replies_count' => 0,
            ],
        ]);
    }

    public function deleteComment(SocialPostComment $comment): JsonResponse
    {
        $user = Auth::user();

        if ($comment->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    public function sendFriendRequest(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        if ($currentUser->id === $user->id) {
            return response()->json(['error' => 'Cannot send friend request to yourself'], 400);
        }

        $friendship = SocialFriendship::create([
            'user_id' => $currentUser->id,
            'friend_id' => $user->id,
            'status' => 'pending',
        ]);

        // Create activity notification
        SocialActivity::create([
            'user_id' => $user->id,
            'actor_id' => $currentUser->id,
            'type' => 'friend_request',
            'subject_type' => SocialFriendship::class,
            'subject_id' => $friendship->id,
        ]);

        return response()->json(['message' => 'Friend request sent']);
    }

    public function acceptFriendRequest(SocialFriendship $friendship): JsonResponse
    {
        $user = Auth::user();

        if ($friendship->friend_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $friendship->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        // Create activity notification
        SocialActivity::create([
            'user_id' => $friendship->user_id,
            'actor_id' => $user->id,
            'type' => 'friend_accept',
            'subject_type' => SocialFriendship::class,
            'subject_id' => $friendship->id,
        ]);

        return response()->json(['message' => 'Friend request accepted']);
    }

    public function profile(User $user): Response
    {
        $currentUser = Auth::user();

        $profile = $user->socialProfile ?: new SocialUserProfile([
            'user_id' => $user->id,
            'profile_visibility' => 'public',
        ]);

        // Check if current user can view this profile
        $canViewProfile = $profile->isPublic() ||
            $user->id === $currentUser->id ||
            $currentUser->isFriendsWith($user);

        if (! $canViewProfile) {
            return Inertia::render('social/profile-private', [
                'profile_user' => $user,
            ]);
        }

        $posts = SocialPost::with(['user', 'likes.user', 'comments.user'])
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($post) use ($currentUser) {
                return [
                    ...$post->toArray(),
                    'likes_count' => $post->likesCount(),
                    'comments_count' => $post->commentsCount(),
                    'shares_count' => $post->sharesCount(),
                    'is_liked_by_user' => $post->isLikedBy($currentUser),
                ];
            });

        // Get accepted friends with their profiles
        $friends = User::whereHas('friendships', function ($query) use ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })->where('status', 'accepted');
        })
            ->with(['socialProfile'])
            ->limit(6) // Show first 6 friends for preview
            ->get()
            ->filter(fn ($friend) => $friend->id !== $user->id) // Remove self from friends list
            ->values();

        // Get total friends count
        $friendsCount = SocialFriendship::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)->orWhere('friend_id', $user->id);
        })->where('status', 'accepted')->count();

        return Inertia::render('social/profile', [
            'profile_user' => [
                ...$user->toArray(),
                'social_profile' => $profile,
                'is_friend_with_user' => $currentUser->isFriendsWith($user),
                'has_pending_friend_request' => $currentUser->hasPendingFriendRequestWith($user),
            ],
            'posts' => $posts,
            'friends' => $friends->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'avatar' => $friend->avatar,
                ];
            }),
            'friends_count' => $friendsCount,
            'current_user' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'avatar' => $currentUser->avatar,
            ],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = Auth::user();

        $profile = $user->socialProfile ?: new SocialUserProfile(['user_id' => $user->id]);

        $profile->fill($request->validated());
        $profile->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $profile,
        ]);
    }

    public function activities(): JsonResponse
    {
        $user = Auth::user();

        $activities = SocialActivity::with(['actor', 'subject'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit(50)
            ->get();

        return response()->json([
            'activities' => $activities,
            'unread_count' => $user->unreadActivitiesCount(),
        ]);
    }

    public function markActivitiesAsRead(): JsonResponse
    {
        $user = Auth::user();

        SocialActivity::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Activities marked as read']);
    }

    public function friendsIndex(): Response
    {
        $user = Auth::user();

        // Get accepted friends only
        $friends = User::whereHas('friendships', function ($query) use ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })->where('status', 'accepted');
        })
            ->with(['socialProfile'])
            ->get()
            ->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'username' => $friend->username ?? str_replace('@', '', explode('@', $friend->email)[0]),
                    'avatar' => $friend->avatar,
                    'location' => $friend->socialProfile?->location,
                    'status' => 'friend',
                ];
            });

        // Get pending friend requests sent by current user
        $sentRequests = User::whereHas('friendshipRequests', function ($query) use ($user) {
            $query->where('user_id', $user->id)->where('status', 'pending');
        })
            ->with(['socialProfile'])
            ->get()
            ->map(function ($friend) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'username' => $friend->username ?? str_replace('@', '', explode('@', $friend->email)[0]),
                    'avatar' => $friend->avatar,
                    'location' => $friend->socialProfile?->location,
                    'status' => 'pending_sent',
                ];
            });

        return Inertia::render('social/friends-index', [
            'friends' => $friends,
            'sentRequests' => $sentRequests,
        ]);
    }

    public function declineFriendRequest(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        $friendship = SocialFriendship::where('user_id', $user->id)
            ->where('friend_id', $currentUser->id)
            ->where('status', 'pending')
            ->first();

        if (! $friendship) {
            return response()->json(['error' => 'Friend request not found'], 404);
        }

        $friendship->delete();

        return response()->json(['message' => 'Friend request declined']);
    }

    public function cancelFriendRequest(?User $friendUser = null): JsonResponse
    {
        $user = Auth::user();

        // Check if route model binding failed, try manual resolution
        if (! $friendUser) {
            $rawUserId = request()->route('user');

            Log::warning('Route model binding failed, attempting manual resolution', [
                'requester_id' => $user->id,
                'raw_user_parameter' => $rawUserId,
                'parameter_type' => gettype($rawUserId),
                'request_path' => request()->path(),
            ]);

            // Try to manually find the user
            if ($rawUserId) {
                try {
                    $friendUser = User::find($rawUserId);
                } catch (Exception $e) {
                    Log::error('Manual user resolution failed', [
                        'user_id' => $rawUserId,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if (! $friendUser) {
                return response()->json(['error' => 'Invalid user ID provided'], 400);
            }
        }

        $friendship = SocialFriendship::where('user_id', $user->id)
            ->where('friend_id', $friendUser->id)
            ->where('status', 'pending')
            ->first();

        if (! $friendship) {
            Log::warning('Friend request not found', [
                'requester_id' => $user->id,
                'friend_id' => $friendUser->id,
                'friend_name' => $friendUser->name,
                'existing_friendships' => SocialFriendship::where('user_id', $user->id)->orWhere('friend_id', $user->id)->get()->toArray(),
            ]);

            return response()->json(['error' => 'Friend request not found'], 404);
        }

        $friendship->delete();

        return response()->json(['message' => 'Friend request cancelled']);
    }

    public function removeFriend(User $friendUser): JsonResponse
    {
        $user = Auth::user();

        SocialFriendship::where(function ($query) use ($user, $friendUser) {
            $query->where('user_id', $user->id)->where('friend_id', $friendUser->id);
        })->orWhere(function ($query) use ($user, $friendUser) {
            $query->where('user_id', $friendUser->id)->where('friend_id', $user->id);
        })->where('status', 'accepted')->delete();

        return response()->json(['message' => 'Friend removed']);
    }
}
