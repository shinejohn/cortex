<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Seeder;

final class ConversationSeeder extends Seeder
{
    /**
     * Seed conversations.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->count() < 2) {
            $this->command->warn('⚠ Need at least 2 users. Run UserSeeder first.');

            return;
        }

        // Create conversations using factory
        $targetCount = 100;
        $conversations = Conversation::factory($targetCount)->create();

        // Add participants to each conversation (2-4 participants)
        foreach ($conversations as $conversation) {
            $creator = $users->random();
            $participantCount = rand(2, 4);
            $availableUsers = $users->where('id', '!=', $creator->id)
                ->random(min($participantCount, $users->count() - 1));

            foreach ($availableUsers as $user) {
                $conversation->participants()->attach($user->id, ['joined_at' => now()]);
            }
            // Add creator as participant
            $conversation->participants()->attach($creator->id, ['joined_at' => now(), 'is_admin' => true]);
        }

        $this->command->info("✓ Created {$targetCount} conversations");
        $this->command->info('✓ Total conversations: '.Conversation::count());
    }
}
