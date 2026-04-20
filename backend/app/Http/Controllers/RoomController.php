<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Room;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::orderByDesc('id')->get();

        return response()->json($rooms);
    }
}
