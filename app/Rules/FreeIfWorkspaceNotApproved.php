<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\Workspace;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class FreeIfWorkspaceNotApproved implements ValidationRule
{
    public function __construct(
        private readonly Workspace $workspace
    ) {}

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // If workspace can accept payments, any price is allowed
        if ($this->workspace->canAcceptPayments()) {
            return;
        }

        // If workspace cannot accept payments, only free (0.00) is allowed
        if ((float) $value !== 0.0) {
            $fail('Your workspace must be approved for Stripe Connect to set paid pricing. Please contact support for approval.');
        }
    }
}
