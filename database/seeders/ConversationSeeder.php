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
        $conversations = Conversation::factory($targetCount)->create([
            'creator_id' => fn() => $users->random()->id,
        ]);

        // Add participants to each conversation (2-4 participants)
        foreach ($conversations as $conversation) {
            $participantCount = rand(2, 4);
            $availableUsers = $users->where('id', '!=', $conversation->creator_id)->random(min($participantCount, $users->count() - 1));

            foreach ($availableUsers as $user) {
                $conversation->participants()->attach($user->id);
            }
            // Add creator as participant
            $conversation->participants()->attach($conversation->creator_id);
        }

        $this->command->info("✓ Created {$targetCount} conversations");
        $this->command->info("✓ Total conversations: " . Conversation::count());
    }
}


