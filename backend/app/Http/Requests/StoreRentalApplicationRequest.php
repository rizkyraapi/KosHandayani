<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentalApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'tenant';
    }

    public function rules(): array
    {
        return [
            'room_id' => ['nullable', 'integer', 'exists:rooms,id'],
            'duration' => ['nullable', 'string', 'max:50'],
        ];
    }
}
