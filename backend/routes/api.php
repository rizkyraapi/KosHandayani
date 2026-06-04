<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RentalApplicationController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

// PUBLIC
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/branches', [BranchController::class, 'index']);
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);
Route::post('/payments/notification', [PaymentController::class, 'notification']);

// PROTECTED
Route::middleware('auth:sanctum')->group(function () {

    // auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/update', [ProfileController::class, 'update']);

    Route::post('/rental-applications', [RentalApplicationController::class, 'store']);
    Route::get('/my-rental-applications', [RentalApplicationController::class, 'myApplications']);
    Route::get('/my-rental-applications/{id}', [RentalApplicationController::class, 'myApplicationDetail']);

    Route::get('/owner/rental-applications', [RentalApplicationController::class, 'ownerIndex']);
    Route::put('/owner/rental-applications/{id}', [RentalApplicationController::class, 'ownerUpdate']);

    Route::post('/payments/create', [PaymentController::class, 'create']);
    Route::get('/my-payments', [PaymentController::class, 'index']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);

    Route::post('/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{room}', [RoomController::class, 'update']);
    Route::post('/rooms/{room}', [RoomController::class, 'update']);
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
});
