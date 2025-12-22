<?php

declare(strict_types=1);

namespace App\Services\AlphaSite;

use App\Models\Business;
use App\Models\BusinessTemplate;

final class TemplateService
{
    /**
     * Get the appropriate template for a business based on industry
     */
    public function getTemplateForBusiness(Business $business): BusinessTemplate
    {
        // First check if business has a custom template
        if ($business->template_id) {
            return BusinessTemplate::find($business->template_id);
        }

        // Use industry default template
        if ($business->industry?->default_template_id) {
            return BusinessTemplate::find($business->industry->default_template_id);
        }

        // Fall back to generic template
        return BusinessTemplate::where('slug', 'generic')->firstOrFail();
    }

    /**
     * Get template configuration with industry-specific overrides
     */
    public function getTemplateConfig(BusinessTemplate $template, Business $business): array
    {
        $baseConfig = $template->layout_config ?? [];
        
        // Apply industry-specific overrides
        $industryOverrides = $this->getIndustryOverrides($business->industry);
        
        // Apply business-level customizations
        $businessOverrides = $business->homepage_content['layout'] ?? [];
        
        return array_merge($baseConfig, $industryOverrides, $businessOverrides);
    }

    /**
     * Get industry-specific template overrides
     */
    private function getIndustryOverrides($industry): array
    {
        if (!$industry) {
            return [];
        }

        return $industry->available_features ?? [];
    }
}

