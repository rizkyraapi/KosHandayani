<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RentalApplicationController;

use App\Http\Controllers\RoomController;


// PUBLIC
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);


// PROTECTED
Route::middleware('auth:sanctum')->group(function () {

    // auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/update', [ProfileController::class, 'update']);

    Route::post('/rental-applications', [RentalApplicationController::class, 'store'])
        ->middleware('check.profile.complete');

    Route::post('/rooms', [RoomController::class, 'store']);
});
