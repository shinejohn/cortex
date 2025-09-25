<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:1000'],
            'type' => ['sometimes', 'string', 'in:text,image,file'],
            'metadata' => ['sometimes', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Message content is required.',
            'message.max' => 'Message cannot be longer than 1000 characters.',
            'type.in' => 'Message type must be text, image, or file.',
        ];
    }
}
