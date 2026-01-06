<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

final class ApiResponse
{
    /**
     * Return a successful JSON response.
     */
    public static function success(mixed $data = null, ?string $message = null, int $code = 200): JsonResponse
    {
        $response = ['success' => true];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($message !== null) {
            $response['message'] = $message;
        }

        return response()->json($response, $code);
    }

    /**
     * Return a successful JSON response with pagination.
     */
    public static function paginated(LengthAwarePaginator $paginator, ?array $meta = null): JsonResponse
    {
        $response = [
            'success' => true,
            'data' => $paginator->items(),
            'meta' => $meta ?? [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ];

        return response()->json($response);
    }

    /**
     * Return an error JSON response.
     */
    public static function error(
        string $message,
        ?string $code = null,
        array $details = [],
        int $httpCode = 400
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $code ?? 'ERROR',
                'message' => $message,
                'details' => $details,
            ],
        ], $httpCode);
    }

    /**
     * Return a validation error JSON response.
     */
    public static function validationError(array $errors, ?string $message = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => 'VALIDATION_ERROR',
                'message' => $message ?? 'The given data was invalid.',
                'details' => $errors,
            ],
        ], 422);
    }

    /**
     * Return a not found JSON response.
     */
    public static function notFound(?string $message = null): JsonResponse
    {
        return self::error(
            $message ?? 'Resource not found.',
            'NOT_FOUND',
            [],
            404
        );
    }

    /**
     * Return an unauthorized JSON response.
     */
    public static function unauthorized(?string $message = null): JsonResponse
    {
        return self::error(
            $message ?? 'Unauthorized.',
            'UNAUTHORIZED',
            [],
            401
        );
    }

    /**
     * Return a forbidden JSON response.
     */
    public static function forbidden(?string $message = null): JsonResponse
    {
        return self::error(
            $message ?? 'Forbidden.',
            'FORBIDDEN',
            [],
            403
        );
    }

    /**
     * Return a no content JSON response.
     */
    public static function noContent(): JsonResponse
    {
        return response()->json(['success' => true], 204);
    }
}


