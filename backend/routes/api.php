<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\EmailPreviewController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\OwnerDataController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RentalApplicationController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

// PUBLIC
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/branches', [BranchController::class, 'index']);
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);
Route::post('/payments/notification', [PaymentController::class, 'notification'])->middleware('throttle:120,1');
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');
Route::get('/rental-documents/{application}/{type}', [RentalApplicationController::class, 'document'])
    ->whereNumber('application')
    ->whereIn('type', ['ktp', 'kk'])
    ->middleware('signed')
    ->name('rental-documents.show');
Route::get('/expense-receipts/{expense}', [ExpenseController::class, 'receipt'])
    ->whereNumber('expense')
    ->middleware('signed')
    ->name('expense-receipts.show');

// PROTECTED
Route::middleware('auth:sanctum')->group(function () {

    // auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/email/resend-verification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:3,1');
    Route::get('/email/verification-status', [EmailVerificationController::class, 'status']);

    Route::middleware('role:tenant')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/update', [ProfileController::class, 'update']);

        Route::post('/rental-applications', [RentalApplicationController::class, 'store'])->middleware('verified.email');
        Route::get('/my-rental-applications', [RentalApplicationController::class, 'myApplications']);
        Route::get('/my-rental-applications/{id}', [RentalApplicationController::class, 'myApplicationDetail'])->whereNumber('id');
        Route::post('/my-rental-applications/{id}/cancel', [RentalApplicationController::class, 'cancelMyApplication'])->whereNumber('id');

        Route::post('/payments/create', [PaymentController::class, 'create'])->middleware('verified.email');
        Route::get('/payments/renewal-context', [PaymentController::class, 'renewalContext']);
        Route::post('/payments/renewal/create', [PaymentController::class, 'createRenewal'])->middleware('verified.email');
        Route::post('/payments/sync-status', [PaymentController::class, 'syncStatus']);
        Route::get('/my-payments', [PaymentController::class, 'index']);
        Route::get('/payments/{id}', [PaymentController::class, 'show'])->whereNumber('id');
    });

    Route::middleware('role:owner')->group(function () {
        Route::get('/owner/rental-applications', [RentalApplicationController::class, 'ownerIndex']);
        Route::get('/owner/rental-applications/{id}', [RentalApplicationController::class, 'ownerShow'])->whereNumber('id');
        Route::put('/owner/rental-applications/{id}', [RentalApplicationController::class, 'ownerUpdate'])->whereNumber('id');
        Route::get('/owner/dashboard', [OwnerDataController::class, 'dashboard']);
        Route::get('/owner/rooms-overview', [OwnerDataController::class, 'rooms']);
        Route::get('/owner/application-monitoring', [OwnerDataController::class, 'applications']);
        Route::get('/owner/payments', [OwnerDataController::class, 'payments']);
        Route::get('/owner/tenants', [OwnerDataController::class, 'tenants']);
        Route::get('/owner/expenses', [ExpenseController::class, 'index']);
        Route::post('/owner/expenses', [ExpenseController::class, 'store']);
        Route::get('/owner/expenses/{expense}', [ExpenseController::class, 'show'])->whereNumber('expense');
        Route::put('/owner/expenses/{expense}', [ExpenseController::class, 'update'])->whereNumber('expense');
        Route::delete('/owner/expenses/{expense}', [ExpenseController::class, 'destroy'])->whereNumber('expense');
        Route::get('/owner/reports', [OwnerDataController::class, 'reports']);
        Route::get('/owner/reports/export-pdf', [OwnerDataController::class, 'exportReportPdf']);

        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::post('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

        if (app()->environment(['local', 'testing'])) {
            Route::get('/debug/email-verification/{userId}', [EmailVerificationController::class, 'debug'])
                ->whereNumber('userId');
            Route::get('/debug/email-preview/verification', [EmailPreviewController::class, 'verification']);
            Route::get('/debug/email-preview/reminder', [EmailPreviewController::class, 'reminder']);
            Route::get('/debug/email-preview/overdue', [EmailPreviewController::class, 'overdue']);
        }
    });
});
