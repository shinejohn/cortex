<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\AIEmployee;
use App\Models\AIEmployeeTask;
use App\Models\Business;
use Illuminate\Support\Collection;

final class AIEmployeeService
{
    /**
     * Get all employees for a business.
     */
    public function getEmployees(Business $business): Collection
    {
        return AIEmployee::where('business_id', $business->id)
            ->where('status', '!=', 'archived')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Hire a new AI employee.
     */
    public function hireEmployee(Business $business, string $role, string $name, ?array $personality = null): AIEmployee
    {
        // Enforce limits based on subscription tier (can be added here later)

        $defaultPersonality = $this->getDefaultPersonality($role);
        $config = array_merge($defaultPersonality, $personality ?? []);

        return AIEmployee::create([
            'business_id' => $business->id,
            'name' => $name,
            'role' => $role,
            'personality_config' => $config,
            'status' => 'active',
            'avatar_url' => $this->getDefaultAvatar($role),
        ]);
    }

    /**
     * Update an employee's configuration.
     */
    public function updateEmployee(AIEmployee $employee, array $data): AIEmployee
    {
        $employee->update($data);

        return $employee->refresh();
    }

    /**
     * Fire (archive) an employee.
     */
    public function fireEmployee(AIEmployee $employee): void
    {
        $employee->update(['status' => 'archived']);
        $employee->delete(); // Soft delete
    }

    /**
     * Assign a task to an employee.
     */
    public function assignTask(AIEmployee $employee, string $type, array $payload, ?string $scheduledAt = null): AIEmployeeTask
    {
        return AIEmployeeTask::create([
            'ai_employee_id' => $employee->id,
            'business_id' => $employee->business_id,
            'type' => $type,
            'status' => 'pending',
            'payload' => $payload,
            'scheduled_at' => $scheduledAt,
        ]);
    }

    private function getDefaultPersonality(string $role): array
    {
        return match ($role) {
            'marketing_manager' => [
                'tone' => 'professional yet creative',
                'focus' => 'growth and engagement',
                'description' => 'Expert in digital marketing campaigns and copy.',
            ],
            'social_media_specialist' => [
                'tone' => 'friendly and trendy',
                'focus' => 'viral content and community',
                'description' => 'Creates engaging social media posts.',
            ],
            'customer_support_agent' => [
                'tone' => 'empathetic and helpful',
                'focus' => 'problem solving',
                'description' => 'Handles customer inquiries and support tickets.',
            ],
            'data_analyst' => [
                'tone' => 'analytical and precise',
                'focus' => 'insights and trends',
                'description' => 'Analyzes business data to find opportunities.',
            ],
            default => [
                'tone' => 'helpful',
                'focus' => 'general assistance',
            ],
        };
    }

    private function getDefaultAvatar(string $role): string
    {
        // Placeholder for now, could be dynamic logic
        return match ($role) {
            'marketing_manager' => 'https://ui-avatars.com/api/?name=Marketing+Manager&background=6366f1&color=fff',
            'social_media_specialist' => 'https://ui-avatars.com/api/?name=Social+Media&background=ec4899&color=fff',
            'customer_support_agent' => 'https://ui-avatars.com/api/?name=Support+Agent&background=10b981&color=fff',
            'data_analyst' => 'https://ui-avatars.com/api/?name=Data+Analyst&background=8b5cf6&color=fff',
            default => 'https://ui-avatars.com/api/?name=AI&background=6b7280&color=fff',
        };
    }
}
