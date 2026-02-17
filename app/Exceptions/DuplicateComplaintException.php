<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

final class DuplicateComplaintException extends Exception
{
    public function __construct()
    {
        parent::__construct('You have already filed a complaint for this content.');
    }
}
