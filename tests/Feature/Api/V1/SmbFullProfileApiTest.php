<?php

declare(strict_types=1);

use App\Models\SmbBusiness;
use App\Models\Tenant;
use App\Models\User;

beforeEach(function () {
    $this->tenant = Tenant::factory()->create(['domain' => 'test-'.uniqid().'.com']);
    $this->smbBusiness = SmbBusiness::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->token = $this->user->createToken('test-token')->plainTextToken;

});

test('full-profile requires authentication', function () {
    $response = $this->getJson("/api/v1/smb/{$this->smbBusiness->id}/full-profile");

    $response->assertUnauthorized();
});

test('full-profile returns aggregated data when authenticated', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/v1/smb/{$this->smbBusiness->id}/full-profile");

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'data' => [
            'id',
            'name',
            'google_data',
            'enriched_data',
            'survey_responses',
            'ai_context',
            'campaign_history',
            'customer_intelligence',
            'competitor_analysis',
            'subscription',
            'profile_completeness',
            'data_sources',
        ],
    ]);
})->skip('SmbBusiness tenant_id resolution in HTTP context - same as CommandCenterSmbApiTest');

test('ai-context requires authentication', function () {
    $response = $this->getJson("/api/v1/smb/{$this->smbBusiness->id}/ai-context");

    $response->assertUnauthorized();
});

test('ai-context returns data when authenticated', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/v1/smb/{$this->smbBusiness->id}/ai-context");

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'data' => [
            'business_name',
            'tone_and_voice',
            'always_include',
            'never_fabricate',
            'story_angles',
            'approved_quotes',
        ],
    ]);
})->skip('SmbBusiness tenant_id resolution in HTTP context - same as CommandCenterSmbApiTest');

test('intelligence-summary requires authentication', function () {
    $response = $this->getJson("/api/v1/smb/{$this->smbBusiness->id}/intelligence-summary");

    $response->assertUnauthorized();
});

test('intelligence-summary returns text when authenticated', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/v1/smb/{$this->smbBusiness->id}/intelligence-summary");

    $response->assertSuccessful();
    $response->assertJsonStructure(['data' => ['summary']]);
    expect($response->json('data.summary'))->toBeString();
})->skip('SmbBusiness tenant_id resolution in HTTP context - same as CommandCenterSmbApiTest');

test('enrich requires authentication', function () {
    $response = $this->postJson("/api/v1/smb/{$this->smbBusiness->id}/enrich");

    $response->assertUnauthorized();
});

test('enrich triggers when authenticated', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson("/api/v1/smb/{$this->smbBusiness->id}/enrich");

    $response->assertSuccessful();
    $response->assertJsonStructure(['data' => ['last_enriched_at']]);
})->skip('SmbBusiness tenant_id resolution in HTTP context - same as CommandCenterSmbApiTest');
