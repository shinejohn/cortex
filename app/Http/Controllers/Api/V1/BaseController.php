<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class BaseController extends Controller
{
    /**
     * Return a successful response.
     */
    protected function success(mixed $data = null, ?string $message = null, int $code = 200): JsonResponse
    {
        return ApiResponse::success($data, $message, $code);
    }

    /**
     * Return a paginated response.
     */
    protected function paginated($paginator, ?array $meta = null): JsonResponse
    {
        return ApiResponse::paginated($paginator, $meta);
    }

    /**
     * Return an error response.
     */
    protected function error(string $message, ?string $code = null, array $details = [], int $httpCode = 400): JsonResponse
    {
        return ApiResponse::error($message, $code, $details, $httpCode);
    }

    /**
     * Return a validation error response.
     */
    protected function validationError(array $errors, ?string $message = null): JsonResponse
    {
        return ApiResponse::validationError($errors, $message);
    }

    /**
     * Return a not found response.
     */
    protected function notFound(?string $message = null): JsonResponse
    {
        return ApiResponse::notFound($message);
    }

    /**
     * Return an unauthorized response.
     */
    protected function unauthorized(?string $message = null): JsonResponse
    {
        return ApiResponse::unauthorized($message);
    }

    /**
     * Return a forbidden response.
     */
    protected function forbidden(?string $message = null): JsonResponse
    {
        return ApiResponse::forbidden($message);
    }

    /**
     * Return a no content response.
     */
    protected function noContent(): JsonResponse
    {
        return ApiResponse::noContent();
    }
}


