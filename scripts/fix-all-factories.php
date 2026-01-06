<?php

/**
 * Fix All Factories
 * Updates incomplete factories with proper field definitions
 */

require __DIR__ . '/../vendor/autoload.php';

$factoriesPath = __DIR__ . '/../database/factories';
$modelsPath = __DIR__ . '/../app/Models';

// Factory definitions based on model requirements
$factoryDefinitions = [
    'Achievement' => [
        'business_id' => '\App\Models\Business::factory()',
        'title' => '$this->faker->sentence()',
        'description' => '$this->faker->paragraph()',
        'source_name' => '$this->faker->company()',
        'source_url' => '$this->faker->url()',
        'achievement_type' => '$this->faker->randomElement([\'award\', \'certification\', \'recognition\', \'milestone\'])',
        'achievement_date' => '$this->faker->date()',
        'expiration_date' => '$this->faker->optional()->date()',
        'icon' => '$this->faker->optional()->word()',
        'badge_image_url' => '$this->faker->optional()->imageUrl()',
        'is_verified' => '$this->faker->boolean(70)',
        'display_order' => '$this->faker->numberBetween(0, 100)',
        'is_featured' => '$this->faker->boolean(30)',
    ],
    'AdCampaign' => [
        'advertiser_id' => '\App\Models\User::factory()',
        'name' => '$this->faker->sentence(3)',
        'status' => '$this->faker->randomElement([\'draft\', \'active\', \'paused\', \'completed\'])',
        'budget' => '$this->faker->randomFloat(2, 100, 10000)',
        'start_date' => '$this->faker->dateTimeBetween(\'now\', \'+1 month\')',
        'end_date' => '$this->faker->dateTimeBetween(\'+1 month\', \'+3 months\')',
    ],
    'AdCreative' => [
        'ad_campaign_id' => '\App\Models\AdCampaign::factory()',
        'name' => '$this->faker->sentence(2)',
        'format' => '$this->faker->randomElement([\'banner\', \'sidebar\', \'inline\', \'popup\'])',
        'headline' => '$this->faker->sentence(4)',
        'body' => '$this->faker->paragraph()',
        'status' => '$this->faker->randomElement([\'draft\', \'active\', \'paused\'])',
    ],
    'AdPlacement' => [
        'platform' => '$this->faker->randomElement([\'day_news\', \'event_city\', \'downtown_guide\', \'alphasite\', \'local_voices\'])',
        'slot' => '$this->faker->randomElement([\'sidebar\', \'header\', \'footer\', \'inline\'])',
        'format' => '$this->faker->randomElement([\'banner\', \'square\', \'rectangle\'])',
        'base_cpm' => '$this->faker->randomFloat(2, 1, 10)',
        'base_cpc' => '$this->faker->randomFloat(2, 0.1, 2)',
        'priority' => '$this->faker->numberBetween(1, 10)',
    ],
    'AdInventory' => [
        'ad_placement_id' => '\App\Models\AdPlacement::factory()',
        'date' => '$this->faker->date()',
        'impressions' => '$this->faker->numberBetween(0, 10000)',
        'clicks' => '$this->faker->numberBetween(0, 500)',
    ],
    'AdImpression' => [
        'advertisement_id' => '\App\Models\Advertisement::factory()',
        'ad_placement_id' => '\App\Models\AdPlacement::factory()',
        'session_id' => '$this->faker->uuid()',
        'ip_hash' => '$this->faker->sha256()',
        'user_agent' => '$this->faker->userAgent()',
        'cost' => '$this->faker->randomFloat(4, 0.001, 0.1)',
    ],
    'AdClick' => [
        'ad_impression_id' => '\App\Models\AdImpression::factory()',
        'session_id' => '$this->faker->uuid()',
        'ip_hash' => '$this->faker->sha256()',
        'cost' => '$this->faker->randomFloat(4, 0.01, 0.5)',
    ],
];

$factories = glob($factoriesPath . '/*Factory.php');

foreach ($factories as $factoryFile) {
    $factoryName = basename($factoryFile, 'Factory.php');
    
    if (!isset($factoryDefinitions[$factoryName])) {
        continue;
    }
    
    $content = file_get_contents($factoryFile);
    
    // Check if factory is empty
    if (strpos($content, 'return [];') === false && strpos($content, 'return [') === false) {
        continue; // Already has definition
    }
    
    $definition = $factoryDefinitions[$factoryName];
    $definitionCode = "    public function definition(): array\n    {\n        return [\n";
    
    foreach ($definition as $field => $value) {
        $definitionCode .= "            '{$field}' => {$value},\n";
    }
    
    $definitionCode .= "        ];\n    }";
    
    // Replace empty definition
    $content = preg_replace(
        '/public function definition\(\): array\s*\{[^}]*return \[[^\]]*\];\s*\}/s',
        $definitionCode,
        $content
    );
    
    file_put_contents($factoryFile, $content);
    echo "✅ Fixed: {$factoryName}Factory\n";
}

echo "\n✅ Factory fixes complete!\n";

