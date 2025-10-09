<?php

declare(strict_types=1);

use App\Models\User;
use Filament\Facades\Filament;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('Admin Panel Access Control', function () {
    it('allows access for users with admin email', function () {
        config(['app.admin_emails' => 'admin@example.com,superadmin@example.com']);

        $adminUser = User::factory()->create(['email' => 'admin@example.com']);
        $panel = Filament::getPanel('admin');

        expect($adminUser->canAccessPanel($panel))->toBeTrue();
    });

    it('allows access for multiple admin emails', function () {
        config(['app.admin_emails' => 'admin@example.com,superadmin@example.com,manager@example.com']);

        $panel = Filament::getPanel('admin');

        $admin1 = User::factory()->create(['email' => 'admin@example.com']);
        $admin2 = User::factory()->create(['email' => 'superadmin@example.com']);
        $admin3 = User::factory()->create(['email' => 'manager@example.com']);

        expect($admin1->canAccessPanel($panel))->toBeTrue();
        expect($admin2->canAccessPanel($panel))->toBeTrue();
        expect($admin3->canAccessPanel($panel))->toBeTrue();
    });

    it('denies access for non-admin users', function () {
        config(['app.admin_emails' => 'admin@example.com,superadmin@example.com']);

        $panel = Filament::getPanel('admin');
        $regularUser = User::factory()->create(['email' => 'user@example.com']);

        expect($regularUser->canAccessPanel($panel))->toBeFalse();
    });

    it('denies access when admin emails env is empty', function () {
        config(['app.admin_emails' => '']);

        $panel = Filament::getPanel('admin');
        $user = User::factory()->create(['email' => 'admin@example.com']);

        expect($user->canAccessPanel($panel))->toBeFalse();
    });

    it('handles emails with spaces correctly', function () {
        config(['app.admin_emails' => 'admin@example.com, superadmin@example.com , manager@example.com']);

        $panel = Filament::getPanel('admin');

        $admin1 = User::factory()->create(['email' => 'admin@example.com']);
        $admin2 = User::factory()->create(['email' => 'superadmin@example.com']);
        $admin3 = User::factory()->create(['email' => 'manager@example.com']);

        expect($admin1->canAccessPanel($panel))->toBeTrue();
        expect($admin2->canAccessPanel($panel))->toBeTrue();
        expect($admin3->canAccessPanel($panel))->toBeTrue();
    });

    it('is case sensitive for email matching', function () {
        config(['app.admin_emails' => 'admin@example.com']);

        $panel = Filament::getPanel('admin');

        $lowerCaseUser = User::factory()->create(['email' => 'admin@example.com']);
        $upperCaseUser = User::factory()->create(['email' => 'Admin@Example.com']);

        expect($lowerCaseUser->canAccessPanel($panel))->toBeTrue();
        expect($upperCaseUser->canAccessPanel($panel))->toBeFalse();
    });

    it('can access admin login page', function () {
        $response = $this->get('/admin/login');

        $response->assertStatus(200);
    });

    it('redirects non-admin users from admin dashboard', function () {
        config(['app.admin_emails' => 'admin@example.com']);

        $regularUser = User::factory()->create(['email' => 'user@example.com']);

        $this->actingAs($regularUser);

        $response = $this->get('/admin');

        $response->assertStatus(403);
    });
});
