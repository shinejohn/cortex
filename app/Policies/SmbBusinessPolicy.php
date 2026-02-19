<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\SmbBusiness;
use App\Models\User;

final class SmbBusinessPolicy
{
    /**
     * Determine whether the user can view the SMB business.
     */
    public function view(User $user, SmbBusiness $smbBusiness): bool
    {
        if (! $user->tenant_id) {
            return false;
        }

        $smbTenantId = $smbBusiness->tenant_id ?? $smbBusiness->tenant?->id;

        if (! $smbTenantId) {
            return false;
        }

        return (string) $user->tenant_id === (string) $smbTenantId;
    }

    /**
     * Determine whether the user can update the SMB business.
     */
    public function update(User $user, SmbBusiness $smbBusiness): bool
    {
        if (! $user->tenant_id) {
            return false;
        }

        return (string) $user->tenant_id === (string) ($smbBusiness->tenant_id ?? $smbBusiness->tenant?->id);
    }

    /**
     * Determine whether the user can delete the SMB business.
     */
    public function delete(User $user, SmbBusiness $smbBusiness): bool
    {
        if (! $user->tenant_id) {
            return false;
        }

        return (string) $user->tenant_id === (string) ($smbBusiness->tenant_id ?? $smbBusiness->tenant?->id);
    }
}
