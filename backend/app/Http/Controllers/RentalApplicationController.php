<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalApplicationRequest;
use App\Models\RentalApplication;

class RentalApplicationController extends Controller
{
    public function store(StoreRentalApplicationRequest $request)
    {
        $application = RentalApplication::create([
            'user_id' => $request->user()->id,
            'room_id' => $request->validated('room_id'),
            'duration' => $request->validated('duration'),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan sewa berhasil dikirim',
            'data' => $application,
        ], 201);
    }
}
