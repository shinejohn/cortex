<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\SocialGroup;
use App\Models\SocialGroupMember;
use App\Models\SocialPost;
use App\Models\SocialPostComment;
use App\Models\SocialPostLike;
use App\Models\SocialUserProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

final class SocialSeeder extends Seeder
{
    public function run(): void
    {
        // Create users with social profiles
        $users = User::factory(20)->create();

        // Create social profiles for each user
        foreach ($users as $user) {
            SocialUserProfile::factory()->create(['user_id' => $user->id]);
        }

        // Create social groups
        $groups = SocialGroup::factory(5)->create([
            'creator_id' => $users->random()->id,
        ]);

        // Add members to groups
        foreach ($groups as $group) {
            $members = $users->random(rand(3, 8));
            foreach ($members as $member) {
                SocialGroupMember::create([
                    'group_id' => $group->id,
                    'user_id' => $member->id,
                    'role' => $member->id === $group->creator_id ? 'admin' : 'member',
                    'status' => 'approved',
                ]);
            }
        }

        // Create social posts
        $posts = SocialPost::factory(50)->create([
            'user_id' => fn () => $users->random()->id,
        ]);

        // Create likes for posts
        foreach ($posts as $post) {
            $likers = $users->random(rand(0, 8));
            foreach ($likers as $liker) {
                SocialPostLike::create([
                    'post_id' => $post->id,
                    'user_id' => $liker->id,
                ]);
            }
        }

        // Create comments for posts
        foreach ($posts as $post) {
            $commentCount = rand(0, 5);
            for ($i = 0; $i < $commentCount; $i++) {
                SocialPostComment::create([
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                    'content' => fake()->sentence(rand(5, 20)),
                    'is_active' => true,
                ]);
            }
        }
    }
}
