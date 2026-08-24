<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FcmToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FcmTokenController extends Controller
{
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'device_type' => 'nullable|string|in:android,ios,web',
            'device_name' => 'nullable|string|max:100',
        ]);

        $user = $request->user();

        FcmToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'token' => $validated['token'],
            ],
            [
                'device_type' => $validated['device_type'] ?? 'android',
                'device_name' => $validated['device_name'] ?? null,
                'last_active_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'FCM Token સફળતાપૂર્વક સિંક થયું.',
        ]);
    }

    public function remove(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        FcmToken::where('user_id', Auth::id())
            ->where('token', $validated['token'])
            ->delete();

        return response()->json([
            'message' => 'FCM Token ડિલીટ થયું.',
        ]);
    }
}
