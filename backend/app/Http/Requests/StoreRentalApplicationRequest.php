<?php

namespace App\Http\Requests;

use App\Models\Room;
use App\Models\RentalApplication;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as ValidationValidator;

class StoreRentalApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'tenant';
    }

    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'move_in_date' => ['required', 'date'],
            'duration' => ['required', 'string', Rule::in(['1 Bulan', '3 Bulan', '6 Bulan', '12 Bulan'])],
            'ktp_file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'kk_file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ];
    }

    public function withValidator(ValidationValidator $validator): void
    {
        $validator->after(function (ValidationValidator $validator): void {
            $user = $this->user();

            if ($user && ! $user->isProfileComplete()) {
                $validator->errors()->add(
                    'profile',
                    'Lengkapi profil terlebih dahulu: whatsapp, alamat, dan pekerjaan wajib diisi.'
                );
            }

            if (! $this->filled('room_id') || $validator->errors()->has('room_id')) {
                return;
            }

            $room = Room::find($this->integer('room_id'));

            if (! $room) {
                return;
            }

            if (! $room->is_available || $room->room_status !== 'available') {
                $validator->errors()->add('room_id', 'Kamar tidak tersedia untuk diajukan.');
            }

            if ($user && RentalApplication::query()
                ->where('user_id', $user->id)
                ->where('room_id', $room->id)
                ->whereIn('status', ['pending', 'approved'])
                ->whereIn('payment_status', ['pending', 'unpaid', 'paid'])
                ->exists()
            ) {
                $validator->errors()->add('room_id', 'Anda sudah memiliki pengajuan aktif untuk kamar ini.');
            }
        });
    }

    protected function failedValidation(ValidatorContract $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pengajuan sewa gagal',
            'data' => [
                'errors' => $validator->errors(),
            ],
        ], 422));
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Hanya tenant yang dapat membuat pengajuan sewa',
            'data' => null,
        ], 403));
    }
}
