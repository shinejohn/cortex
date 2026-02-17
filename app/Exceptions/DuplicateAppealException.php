<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

final class DuplicateAppealException extends Exception
{
    public function __construct()
    {
        parent::__construct('An appeal has already been filed for this moderation decision.');
    }
}
