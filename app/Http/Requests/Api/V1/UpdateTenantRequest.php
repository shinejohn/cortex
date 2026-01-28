<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenant = $this->route('tenant');
        $tenantId = is_object($tenant) ? $tenant->id : $tenant;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'subdomain' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('tenants')->ignore($tenantId)],
            'domain' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email'],
            'phone' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'settings' => ['sometimes', 'array'],
            'metadata' => ['sometimes', 'array'],
        ];
    }
}


