<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

final class MessageSeeder extends Seeder
{
    /**
     * Seed messages.
     */
    public function run(): void
    {
        $conversations = Conversation::with('participants')->get();
        $users = User::all();

        if ($conversations->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠ No conversations or users found. Run ConversationSeeder and UserSeeder first.');
            return;
        }

        foreach ($conversations as $conversation) {
            // Create 5-20 messages per conversation
            $messageCount = rand(5, 20);
            $participants = $conversation->participants;

            if ($participants->isEmpty()) {
                continue;
            }

            for ($i = 0; $i < $messageCount; $i++) {
                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $participants->random()->id,
                ]);
            }
        }

        $totalMessages = Message::count();
        $this->command->info("✓ Total messages: {$totalMessages}");
    }
}


