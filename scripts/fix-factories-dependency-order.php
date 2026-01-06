<?php

/**
 * Fix Factories in Dependency Order
 * Base models first (no foreign keys), then dependent models
 */

require __DIR__ . '/../vendor/autoload.php';

$modelsPath = __DIR__ . '/../app/Models';
$factoriesPath = __DIR__ . '/../database/factories';

// Get all models
$models = collect(glob($modelsPath . '/*.php'))
    ->map(fn($f) => basename($f, '.php'))
    ->filter(fn($m) => class_exists("App\\Models\\{$m}"))
    ->filter(fn($m) => !in_array($m, ['Model', 'BaseModel']))
    ->sort()
    ->values();

// Level 0: Base models (no foreign keys or minimal dependencies)
$level0 = ['User', 'Workspace', 'Region', 'Community', 'Industry', 'Role', 'Tag', 'EmailTemplate'];

// Level 1: Depends on Level 0
$level1 = ['Business', 'BusinessTemplate', 'AlphaSiteCommunity', 'Calendar', 'Event', 'Venue', 'Performer'];

// Level 2: Depends on Level 1
$level2 = ['DayNewsPost', 'Announcement', 'Memorial', 'LegalNotice', 'Classified', 'Coupon', 'ArticleComment', 'Tag'];

// Level 3: Depends on Level 2
$level3 = ['ArticleCommentLike', 'CouponUsage', 'ClassifiedImage', 'ClassifiedPayment'];

// Level 4: Complex dependencies
$level4 = ['TicketPlan', 'TicketOrder', 'TicketOrderItem', 'PromoCode', 'PromoCodeUsage', 'CheckIn', 'Booking', 'PlannedEvent'];

// Level 5: Ad system
$level5 = ['Advertisement', 'AdCampaign', 'AdCreative', 'AdPlacement', 'AdInventory', 'AdImpression', 'AdClick'];

// Level 6: Email/Emergency system
$level6 = ['EmailSubscriber', 'EmailCampaign', 'EmailSend', 'EmergencyAlert', 'EmergencySubscription', 'EmergencyDelivery', 'EmergencyAuditLog', 'MunicipalPartner'];

// Level 7: Hub system
$level7 = ['Hub', 'HubSection', 'HubMember', 'HubRole', 'HubAnalytics'];

// Level 8: Social/Community
$level8 = ['SocialAccount', 'SocialPost', 'SocialGroup', 'Conversation', 'Message', 'Follow'];

// Level 9: Other
$level9 = ['Achievement', 'Review', 'Rating', 'BusinessFaq', 'BusinessSubscription', 'BusinessSurvey', 'BusinessSurveyResponse', 'CalendarEvent', 'CalendarFollower', 'CalendarRole', 'Cart', 'CartItem', 'Product', 'Store', 'Order', 'OrderItem', 'CreatorProfile', 'Podcast', 'PodcastEpisode', 'Photo', 'PhotoAlbum', 'SearchHistory', 'SearchSuggestion', 'CrossDomainAuthToken', 'NewsWorkflowRun', 'NewsWorkflowSetting', 'NewsFetchFrequency', 'NewsFactCheck', 'NewsArticle', 'NewsArticleDraft', 'EventExtractionDraft', 'RssFeed', 'RssFeedItem', 'WriterAgent', 'SMBCrmCustomer', 'SMBCrmInteraction'];

$allLevels = array_merge($level0, $level1, $level2, $level3, $level4, $level5, $level6, $level7, $level8, $level9);

echo "Fixing factories in dependency order...\n\n";

$fixed = 0;
$skipped = 0;

foreach ($allLevels as $modelName) {
    $modelFile = $modelsPath . '/' . $modelName . '.php';
    $factoryFile = $factoriesPath . '/' . $modelName . 'Factory.php';
    
    if (!file_exists($modelFile)) {
        continue;
    }
    
    // Create factory if missing
    if (!file_exists($factoryFile)) {
        exec("php artisan make:factory {$modelName}Factory --model={$modelName} 2>&1", $output, $return);
        if ($return === 0) {
            echo "✅ Created: {$modelName}Factory\n";
            $fixed++;
        }
    }
    
    // Fix factory if incomplete
    if (file_exists($factoryFile)) {
        $content = file_get_contents($factoryFile);
        
        // Check if factory is empty
        if (strpos($content, 'return [];') !== false || (strpos($content, 'return [') !== false && strpos($content, '//') !== false && substr_count($content, "'") < 5)) {
            // Read model to get fillable fields
            $modelContent = file_get_contents($modelFile);
            
            preg_match('/protected\s+\$fillable\s*=\s*\[(.*?)\];/s', $modelContent, $matches);
            
            if (!empty($matches[1])) {
                $fillableFields = [];
                preg_match_all("/'([^']+)'/", $matches[1], $fieldMatches);
                if (!empty($fieldMatches[1])) {
                    $fillableFields = $fieldMatches[1];
                }
                
                if (!empty($fillableFields)) {
                    // Build factory definition
                    $definition = "    public function definition(): array\n    {\n        return [\n";
                    
                    foreach ($fillableFields as $field) {
                        if (in_array($field, ['id', 'created_at', 'updated_at', 'deleted_at'])) {
                            continue;
                        }
                        
                        // Handle foreign keys
                        if (str_ends_with($field, '_id')) {
                            $relatedModel = str_replace('_id', '', $field);
                            $relatedModel = str_replace('_', '', ucwords($relatedModel, '_'));
                            
                            // Handle special cases
                            if ($relatedModel === 'Advertiser') $relatedModel = 'Business';
                            if ($relatedModel === 'Campaign') $relatedModel = 'AdCampaign';
                            if ($relatedModel === 'Creative') $relatedModel = 'AdCreative';
                            if ($relatedModel === 'Placement') $relatedModel = 'AdPlacement';
                            if ($relatedModel === 'Subscriber') $relatedModel = 'EmailSubscriber';
                            if ($relatedModel === 'Alert') $relatedModel = 'EmergencyAlert';
                            if ($relatedModel === 'Subscription') $relatedModel = 'EmergencySubscription';
                            if ($relatedModel === 'Article') $relatedModel = 'DayNewsPost';
                            
                            $definition .= "            '{$field}' => \\App\\Models\\{$relatedModel}::factory(),\n";
                            continue;
                        }
                        
                        // Handle common field types
                        if (str_contains($field, 'email')) {
                            $definition .= "            '{$field}' => \$this->faker->email(),\n";
                        } elseif (str_contains($field, 'phone')) {
                            $definition .= "            '{$field}' => \$this->faker->phoneNumber(),\n";
                        } elseif (str_contains($field, 'url') || str_contains($field, 'image') || str_contains($field, 'photo')) {
                            $definition .= "            '{$field}' => \$this->faker->optional()->url(),\n";
                        } elseif (str_contains($field, 'date') || str_contains($field, '_at')) {
                            $definition .= "            '{$field}' => \$this->faker->dateTime(),\n";
                        } elseif (str_contains($field, 'name') || str_contains($field, 'title')) {
                            $definition .= "            '{$field}' => \$this->faker->sentence(),\n";
                        } elseif (str_contains($field, 'description') || str_contains($field, 'content') || str_contains($field, 'body') || str_contains($field, 'message')) {
                            $definition .= "            '{$field}' => \$this->faker->paragraph(),\n";
                        } elseif (str_contains($field, 'price') || str_contains($field, 'amount') || str_contains($field, 'cost') || str_contains($field, 'budget')) {
                            $definition .= "            '{$field}' => \$this->faker->randomFloat(2, 0, 1000),\n";
                        } elseif (str_contains($field, 'count') || str_contains($field, 'quantity') || str_contains($field, 'number')) {
                            $definition .= "            '{$field}' => \$this->faker->numberBetween(0, 100),\n";
                        } elseif (str_contains($field, 'is_') || str_contains($field, 'has_')) {
                            $definition .= "            '{$field}' => \$this->faker->boolean(),\n";
                        } elseif (str_contains($field, 'status')) {
                            $definition .= "            '{$field}' => \$this->faker->randomElement(['active', 'inactive', 'pending', 'draft', 'published']),\n";
                        } elseif (str_contains($field, 'type')) {
                            $definition .= "            '{$field}' => \$this->faker->word(),\n";
                        } elseif (str_contains($field, 'slug')) {
                            $definition .= "            '{$field}' => \$this->faker->slug(),\n";
                        } elseif (str_contains($field, 'uuid')) {
                            $definition .= "            '{$field}' => \$this->faker->uuid(),\n";
                        } else {
                            $definition .= "            '{$field}' => \$this->faker->word(),\n";
                        }
                    }
                    
                    $definition .= "        ];\n    }";
                    
                    // Replace empty definition
                    $oldPattern = '/public function definition\(\): array\s*\{[^}]*return\s*\[[^\]]*\];\s*\}/s';
                    $newContent = preg_replace($oldPattern, $definition, $content);
                    
                    if ($newContent !== $content) {
                        file_put_contents($factoryFile, $newContent);
                        echo "✅ Fixed: {$modelName}Factory\n";
                        $fixed++;
                    } else {
                        $skipped++;
                    }
                }
            }
        }
    }
}

echo "\n✅ Fixed: {$fixed} factories\n";
echo "⏭️  Skipped: {$skipped} factories (already complete)\n";

