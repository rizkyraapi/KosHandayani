<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'job' => 'required',
            'address' => 'required',
        ]);

        $user = $request->user();

        $user->update([
            'phone' => $request->phone,
            'job' => $request->job,
            'address' => $request->address,

            // profile sudah lengkap
            'profile_completed' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui',
            'user' => $user
        ]);
    }
}