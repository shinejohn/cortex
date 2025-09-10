<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Queue\SerializesModels;

final class Registered
{
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user  The authenticated user.
     */
    public function __construct(
        public $user,
        public ?string $invitationToken = null,
    ) {}
}
