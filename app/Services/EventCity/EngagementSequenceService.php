<?php

declare(strict_types=1);

namespace App\Services\EventCity;

use App\Events\EventCity\SequenceStepTriggered;
use App\Models\Event;
use App\Models\SequenceEnrollment;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Throwable;

final class EngagementSequenceService
{
    /**
     * Enroll a user in an engagement sequence.
     */
    public function enrollUser(User $user, string $triggerType, ?Event $event = null): SequenceEnrollment
    {
        return SequenceEnrollment::create([
            'user_id' => $user->id,
            'event_id' => $event?->id,
            'trigger_type' => $triggerType,
            'current_step' => 0,
            'status' => 'active',
            'next_step_at' => now()->addHours(1),
            'step_history' => [],
        ]);
    }

    /**
     * Process all enrollments that have due steps.
     *
     * @return int Number of steps processed
     */
    public function processNextSteps(): int
    {
        $dueEnrollments = SequenceEnrollment::query()
            ->active()
            ->where('next_step_at', '<=', now())
            ->limit(100)
            ->get();

        $processed = 0;

        foreach ($dueEnrollments as $enrollment) {
            try {
                $this->executeStep($enrollment);
                $processed++;
            } catch (Throwable $e) {
                Log::error('Failed to execute engagement step', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $processed;
    }

    /**
     * Execute the current step for an enrollment.
     */
    public function executeStep(SequenceEnrollment $enrollment): void
    {
        $maxSteps = $this->getMaxStepsForTrigger($enrollment->trigger_type);

        if ($enrollment->current_step >= $maxSteps) {
            $enrollment->complete();

            return;
        }

        event(new SequenceStepTriggered($enrollment));

        $enrollment->advance();

        if ($enrollment->current_step >= $maxSteps) {
            $enrollment->complete();
        }
    }

    /**
     * Get the maximum number of steps for a given trigger type.
     */
    private function getMaxStepsForTrigger(string $triggerType): int
    {
        return match ($triggerType) {
            'event_view' => 3,
            'ticket_purchase' => 5,
            'search' => 2,
            'save' => 3,
            'share' => 2,
            default => 3,
        };
    }
}
