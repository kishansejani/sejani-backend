<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FamilyController;
use App\Http\Controllers\Api\FarmingController;
use App\Http\Controllers\Api\FcmTokenController;
use App\Http\Controllers\Api\PersonalRecordController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TractorWorkController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'શ્રી સેજાણી પરિવાર API (Sejani Family Portal)',
        'version' => '1.0.0',
        'server_time' => now()->toDateTimeString(),
        'message' => 'API is running live and secure!',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Auth)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // Family Directory (Shared within family)
    Route::get('/family', [FamilyController::class, 'index']);
    Route::get('/family/members/{userId}', [FamilyController::class, 'memberDetails']);
    Route::post('/family/add-member', [FamilyController::class, 'addMember']);

    // Personal Records (Strict User Ownership Vault)
    Route::apiResource('personal-records', PersonalRecordController::class);

    // Farming & Calculation Engine (Multi-unit: Khandi, Man, KG, Quintal)
    Route::get('/farming/summary', [FarmingController::class, 'getSummary']);
    Route::post('/farming/production', [FarmingController::class, 'storeProduction']);
    Route::post('/farming/expense', [FarmingController::class, 'storeExpense']);
    Route::delete('/farming/production/{id}', [FarmingController::class, 'deleteProduction']);
    Route::delete('/farming/expense/{id}', [FarmingController::class, 'deleteExpense']);

    // Tractor Operations & Custom Work Billing (દાંતી, રાંપ, માઢ, સાવડા)
    Route::get('/tractor-works', [TractorWorkController::class, 'index']);
    Route::post('/tractor-works', [TractorWorkController::class, 'store']);
    Route::delete('/tractor-works/{id}', [TractorWorkController::class, 'destroy']);

    // Tasks & Time-based Alerts / Reminders
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::patch('/tasks/{id}/toggle', [TaskController::class, 'toggleComplete']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

    // FCM Notification Token Sync
    Route::post('/fcm-token', [FcmTokenController::class, 'sync']);
    Route::delete('/fcm-token', [FcmTokenController::class, 'remove']);
});
