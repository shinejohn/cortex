<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Concerns\HasUuid;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

final class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasUuid, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'current_workspace_id',
        'tenant_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar',
    ];

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function getAvatarAttribute(): string
    {
        return $this->socialAccounts()->first()?->avatar ?? "https://api.dicebear.com/9.x/fun-emoji/svg?seed={$this->id}&flip=true&backgroundType=solid,gradientLinear&eyes=closed,cute,glasses,love,pissed,plain,sad,shades,sleepClose,tearDrop,wink,wink2,closed2&mouth=cute,kissHeart,lilSmile,plain,shy,smileLol,smileTeeth,tongueOut,wideSmile";
    }

    public function workspaces(): HasMany
    {
        return $this->hasMany(WorkspaceMembership::class);
    }

    public function currentWorkspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class, 'current_workspace_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function workspaceMemberships(): HasMany
    {
        return $this->hasMany(WorkspaceMembership::class);
    }

    /**
     * Check if user is a member of the given workspace
     */
    public function isMemberOfWorkspace(?string $workspaceId): bool
    {
        if (! $workspaceId) {
            return false;
        }

        return $this->workspaceMemberships()
            ->where('workspace_id', $workspaceId)
            ->exists();
    }

    /**
     * Get user's membership for a specific workspace
     */
    public function getMembershipForWorkspace(string $workspaceId): ?WorkspaceMembership
    {
        return $this->workspaceMemberships()
            ->where('workspace_id', $workspaceId)
            ->first();
    }

    /**
     * Check if user can manage resources in a workspace (owner or admin)
     */
    public function hasSomePermissions(array $permissions, ?string $workspaceId): bool
    {
        if (! $workspaceId) {
            return false;
        }

        return $this->workspaceMemberships()
            ->where('workspace_id', $workspaceId)
            ->get()
            ->some(fn ($membership) => collect($permissions)->some(fn ($permission) => in_array($permission, $membership->permissions)));
    }

    public function hasAllPermissions(array $permissions, ?string $workspaceId): bool
    {
        if (! $workspaceId) {
            return false;
        }

        return $this->workspaceMemberships()
            ->where('workspace_id', $workspaceId)
            ->get()
            ->every(fn ($membership) => collect($permissions)->every(fn ($permission) => in_array($permission, $membership->permissions)));
    }

    public function isOwnerOfWorkspace(?string $workspaceId): bool
    {
        if (! $workspaceId) {
            return false;
        }

        return $this->workspaceMemberships()
            ->where('workspace_id', $workspaceId)
            ->where('role', 'owner')
            ->exists();
    }

    // Social relationships
    public function socialPosts(): HasMany
    {
        return $this->hasMany(SocialPost::class);
    }

    public function authoredDayNewsPosts(): HasMany
    {
        return $this->hasMany(DayNewsPost::class, 'author_id');
    }

    public function socialProfile(): HasOne
    {
        return $this->hasOne(SocialUserProfile::class);
    }

    public function friendships(): HasMany
    {
        return $this->hasMany(SocialFriendship::class);
    }

    public function friendshipRequests(): HasMany
    {
        return $this->hasMany(SocialFriendship::class, 'friend_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(SocialUserFollow::class, 'following_id');
    }

    public function following(): HasMany
    {
        return $this->hasMany(SocialUserFollow::class, 'follower_id');
    }

    public function socialGroups(): HasMany
    {
        return $this->hasMany(SocialGroup::class, 'creator_id');
    }

    public function groupMemberships(): HasMany
    {
        return $this->hasMany(SocialGroupMember::class);
    }

    public function groupInvitations(): HasMany
    {
        return $this->hasMany(SocialGroupInvitation::class, 'invited_id');
    }

    public function sentGroupInvitations(): HasMany
    {
        return $this->hasMany(SocialGroupInvitation::class, 'inviter_id');
    }

    public function socialActivities(): HasMany
    {
        return $this->hasMany(SocialActivity::class);
    }

    public function actorActivities(): HasMany
    {
        return $this->hasMany(SocialActivity::class, 'actor_id');
    }

    // Social helper methods
    public function isFriendsWith(self $user): bool
    {
        return $this->friendships()
            ->where('friend_id', $user->id)
            ->where('status', 'accepted')
            ->exists() ||
            $this->friendshipRequests()
                ->where('user_id', $user->id)
                ->where('status', 'accepted')
                ->exists();
    }

    public function hasPendingFriendRequestWith(self $user): bool
    {
        return $this->friendships()
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->exists() ||
            $this->friendshipRequests()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->exists();
    }

    public function isFollowing(self $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    public function isMemberOfGroup(SocialGroup $group): bool
    {
        return $this->groupMemberships()
            ->where('group_id', $group->id)
            ->where('status', 'approved')
            ->exists();
    }

    public function unreadActivitiesCount(): int
    {
        return $this->socialActivities()->unread()->count();
    }

    /**
     * Determine if the user can access the Filament admin panel
     */
    public function canAccessPanel(Panel $panel): bool
    {
        // Only check for admin panel
        if ($panel->getId() !== 'admin') {
            return true;
        }

        $adminEmails = $this->getAdminEmails();

        return in_array($this->email, $adminEmails, true);
    }

    public function acceptedFriends(): HasMany
    {
        return $this->hasMany(SocialFriendship::class)
            ->where('status', 'accepted');
    }

    public function blockedUsers(): HasMany
    {
        return $this->hasMany(SocialFriendship::class)
            ->where('status', 'blocked');
    }

    // Messaging relationships
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->using(ConversationParticipant::class)
            ->withPivot(['id', 'joined_at', 'last_read_at', 'is_admin'])
            ->withTimestamps();
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function conversationParticipants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function follows(): HasMany
    {
        return $this->hasMany(Follow::class);
    }

    public function ticketOrders(): HasMany
    {
        return $this->hasMany(TicketOrder::class);
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }

    public function plannedEvents(): HasMany
    {
        return $this->hasMany(PlannedEvent::class);
    }

    public function hubMemberships(): HasMany
    {
        return $this->hasMany(HubMember::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_private_profile' => 'boolean',
            'allow_friend_requests' => 'boolean',
            'allow_group_invites' => 'boolean',
            'last_active_at' => 'datetime',
        ];
    }

    /**
     * Get the list of admin emails from configuration
     *
     * @return array<int, string>
     */
    private function getAdminEmails(): array
    {
        $emails = config('app.admin_emails', '');

        if (empty($emails)) {
            return [];
        }

        return array_map(
            fn (string $email) => mb_trim($email),
            explode(',', $emails)
        );
    }
}
