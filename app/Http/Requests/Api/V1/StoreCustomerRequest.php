<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

final class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['required', 'uuid', 'exists:tenants,id'],
            'smb_business_id' => ['sometimes', 'nullable', 'uuid', 'exists:smb_businesses,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email'],
            'phone' => ['sometimes', 'nullable', 'string'],
            'lifecycle_stage' => ['sometimes', 'string', 'in:lead,mql,sql,customer'],
            'lead_source' => ['sometimes', 'nullable', 'string'],
        ];
    }
}


