<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

final class EmailTemplateSeeder extends Seeder
{
    /**
     * Seed email templates.
     */
    public function run(): void
    {

        // Create email templates using factory
        $targetCount = 20;
        $templates = EmailTemplate::factory($targetCount)->create();

        $this->command->info("✓ Created {$targetCount} email templates");
        $this->command->info('✓ Total email templates: '.EmailTemplate::count());
    }
}
