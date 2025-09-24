<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SocialActivity;
use App\Models\SocialCommentLike;
use App\Models\SocialFriendship;
use App\Models\SocialGroup;
use App\Models\SocialGroupInvitation;
use App\Models\SocialGroupMember;
use App\Models\SocialGroupPost;
use App\Models\SocialPost;
use App\Models\SocialPostComment;
use App\Models\SocialPostLike;
use App\Models\SocialPostShare;
use App\Models\SocialUserFollow;
use App\Models\SocialUserProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

final class SocialSeeder extends Seeder
{
    public function run(): void
    {
        // Create users with social profiles
        $users = User::factory(30)->create();

        // Create social profiles for each user
        foreach ($users as $user) {
            SocialUserProfile::factory()->create(['user_id' => $user->id]);
        }

        // Create friendships
        foreach ($users->take(20) as $user) {
            $potentialFriends = $users->except($user->id)->random(rand(2, 8));
            foreach ($potentialFriends as $friend) {
                // Avoid duplicate friendships
                if (! SocialFriendship::where('user_id', $user->id)->where('friend_id', $friend->id)->exists() &&
                    ! SocialFriendship::where('user_id', $friend->id)->where('friend_id', $user->id)->exists()) {
                    SocialFriendship::factory()->create([
                        'user_id' => $user->id,
                        'friend_id' => $friend->id,
                    ]);
                }
            }
        }

        // Create user follows
        foreach ($users->take(25) as $user) {
            $usersToFollow = $users->except($user->id)->random(rand(1, 10));
            foreach ($usersToFollow as $userToFollow) {
                // Avoid duplicate follows
                if (! SocialUserFollow::where('follower_id', $user->id)->where('following_id', $userToFollow->id)->exists()) {
                    SocialUserFollow::factory()->create([
                        'follower_id' => $user->id,
                        'following_id' => $userToFollow->id,
                    ]);
                }
            }
        }

        // Create social groups
        $groups = SocialGroup::factory(8)->create([
            'creator_id' => fn () => $users->random()->id,
        ]);

        // Add members to groups
        foreach ($groups as $group) {
            // Add the creator as admin
            SocialGroupMember::factory()->admin()->create([
                'group_id' => $group->id,
                'user_id' => $group->creator_id,
            ]);

            // Add random members
            $members = $users->except($group->creator_id)->random(rand(3, 12));
            foreach ($members as $member) {
                // Avoid duplicate memberships
                if (! SocialGroupMember::where('group_id', $group->id)->where('user_id', $member->id)->exists()) {
                    SocialGroupMember::factory()->create([
                        'group_id' => $group->id,
                        'user_id' => $member->id,
                    ]);
                }
            }
        }

        // Create group invitations
        foreach ($groups as $group) {
            $nonMembers = $users->whereNotIn('id', $group->members->pluck('user_id'));
            if ($nonMembers->count() > 0) {
                $invitees = $nonMembers->random(min($nonMembers->count(), rand(1, 3)));
                foreach ($invitees as $invitee) {
                    SocialGroupInvitation::factory()->create([
                        'group_id' => $group->id,
                        'inviter_id' => $group->creator_id,
                        'invited_id' => $invitee->id,
                    ]);
                }
            }
        }

        // Create social posts
        $posts = SocialPost::factory(80)->create([
            'user_id' => fn () => $users->random()->id,
        ]);

        // Create group posts
        foreach ($groups as $group) {
            $groupMembers = $group->members->pluck('user_id');
            if ($groupMembers->count() > 0) {
                SocialGroupPost::factory(rand(2, 8))->create([
                    'group_id' => $group->id,
                    'user_id' => fn () => $groupMembers->random(),
                ]);
            }
        }

        // Create likes for posts
        foreach ($posts as $post) {
            $likers = $users->random(rand(0, 15));
            foreach ($likers as $liker) {
                // Avoid duplicate likes
                if (! SocialPostLike::where('post_id', $post->id)->where('user_id', $liker->id)->exists()) {
                    SocialPostLike::factory()->create([
                        'post_id' => $post->id,
                        'user_id' => $liker->id,
                    ]);
                }
            }
        }

        // Create comments for posts
        $comments = [];
        foreach ($posts as $post) {
            $commentCount = rand(0, 8);
            for ($i = 0; $i < $commentCount; $i++) {
                $comment = SocialPostComment::factory()->create([
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                ]);
                $comments[] = $comment;
            }
        }

        // Create likes for comments
        foreach ($comments as $comment) {
            $likers = $users->random(rand(0, 5));
            foreach ($likers as $liker) {
                // Avoid duplicate comment likes
                if (! SocialCommentLike::where('comment_id', $comment->id)->where('user_id', $liker->id)->exists()) {
                    SocialCommentLike::factory()->create([
                        'comment_id' => $comment->id,
                        'user_id' => $liker->id,
                    ]);
                }
            }
        }

        // Create post shares
        foreach ($posts->random(min($posts->count(), 20)) as $post) {
            $sharers = $users->random(rand(1, 3));
            foreach ($sharers as $sharer) {
                SocialPostShare::factory()->create([
                    'post_id' => $post->id,
                    'user_id' => $sharer->id,
                ]);
            }
        }

        // Create some comment replies
        $parentComments = collect($comments)->random(min(count($comments), 15));
        foreach ($parentComments as $parentComment) {
            SocialPostComment::factory(rand(1, 3))->create([
                'post_id' => $parentComment->post_id,
                'user_id' => $users->random()->id,
                'parent_id' => $parentComment->id,
            ]);
        }

        // Create social activities (notifications)
        foreach ($users->take(20) as $user) {
            SocialActivity::factory(rand(5, 15))->create([
                'user_id' => $user->id,
                'actor_id' => fn () => $users->except($user->id)->random()->id,
            ]);
        }
    }
}
