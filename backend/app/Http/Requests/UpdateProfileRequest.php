<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'tenant';
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'whatsapp' => ['required', 'string', 'max:30'],
            'pekerjaan' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:1000'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'whatsapp.required' => 'Nomor WhatsApp wajib diisi.',
            'pekerjaan.required' => 'Pekerjaan wajib diisi.',
            'address.required' => 'Alamat wajib diisi.',
            'profile_photo.image' => 'File foto profil harus berupa gambar.',
            'profile_photo.mimes' => 'Foto profil harus berformat JPG, JPEG, atau PNG.',
            'profile_photo.max' => 'Ukuran foto profil maksimal 2MB.',
        ];
    }
}
