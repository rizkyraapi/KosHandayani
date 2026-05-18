<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show()
    {
        return response()->json([
            'data' => request()->user()->toProfileArray(),
        ]);
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = [
            'name' => $request->validated('full_name'),
            'phone' => $request->validated('whatsapp'),
            'job' => $request->validated('pekerjaan'),
            'address' => $request->validated('address'),
            'profile_completed' => true,
        ];

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $data['profile_photo'] = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile berhasil diperbarui',
            'data' => $user->fresh()->toProfileArray(),
        ]);
    }
}
