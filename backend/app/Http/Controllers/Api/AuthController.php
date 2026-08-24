<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone',
            'password' => 'required|string|min:6',
            'relationship' => 'nullable|string',
            'device_name' => 'nullable|string',
        ], [
            'name.required' => 'તમારું પૂરું નામ દાખલ કરો.',
            'phone.required' => 'મોબાઈલ નંબર દાખલ કરવો જરૂરી છે.',
            'phone.unique' => 'આ મોબાઈલ નંબર પહેલેથી રજિસ્ટર થયેલ છે.',
            'password.required' => 'પાસવર્ડ દાખલ કરવો જરૂરી છે.',
            'password.min' => 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'status' => 'active',
        ]);

        // Create Profile
        \App\Models\UserProfile::create([
            'user_id' => $user->id,
            'full_name_gu' => $validated['name'],
            'role_in_family' => $validated['relationship'] ?? 'member',
            'relationship_to_head' => $validated['relationship'] ?? 'સભ્ય',
        ]);

        // Link to first family (Sejani Family)
        $family = \App\Models\Family::first();
        if ($family) {
            $user->families()->attach($family->id, [
                'relation_title_gu' => $validated['relationship'] ?? 'સભ્ય',
                'is_admin' => false,
            ]);
        }

        $deviceName = $request->device_name ?? 'mobile-app';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'message' => 'એકાઉન્ટ સફળતાપૂર્વક બની ગયું છે! સ્વાગત છે.',
            'token' => $token,
            'user' => new UserResource($user->load(['profile', 'families'])),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // phone or email
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ], [
            'login.required' => 'મોબાઈલ નંબર અથવા ઈમેલ દાખલ કરવો જરૂરી છે.',
            'password.required' => 'પાસવર્ડ દાખલ કરવો જરૂરી છે.',
        ]);

        $loginInput = $request->input('login');

        // Look up by phone or email
        $user = User::where('phone', $loginInput)
            ->orWhere('email', $loginInput)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed attempt
            AuditLog::create([
                'user_id' => $user?->id,
                'action' => 'unauthorized_login_attempt',
                'details' => 'ખોટો પાસવર્ડ અથવા મોબાઈલ: ' . $loginInput,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'login' => ['મોબાઈલ નંબર અથવા પાસવર્ડ ખોટો છે.'],
            ]);
        }

        if ($user->status === 'blocked') {
            return response()->json([
                'message' => 'તમારું એકાઉન્ટ બ્લોક કરેલ છે. પરિવાર મોભીનો સંપર્ક કરો.',
            ], 403);
        }

        // Revoke old tokens if device_name provided or generate new Sanctum token
        $deviceName = $request->device_name ?? 'mobile-app';
        $token = $user->createToken($deviceName)->plainTextToken;

        // Log successful login
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login_success',
            'details' => 'સફળ લૉગિન: ' . $deviceName,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'લૉગિન સફળ થયું. સ્વાગત છે!',
            'token' => $token,
            'user' => new UserResource($user->load(['profile', 'families'])),
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['profile', 'families']);
        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'details' => 'લૉગ આઉટ થયું.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'message' => 'સફળતાપૂર્વક લૉગ આઉટ થયા.',
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'current_password.required' => 'હાલનો પાસવર્ડ દાખલ કરો.',
            'new_password.required' => 'નવો પાસવર્ડ દાખલ કરો.',
            'new_password.min' => 'નવો પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.',
            'new_password.confirmed' => 'પાસવર્ડ કન્ફર્મેશન મેળ ખાતું નથી.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'હાલનો પાસવર્ડ ખોટો છે.',
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_change',
            'details' => 'પાસવર્ડ બદલવામાં આવ્યો.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે.',
        ]);
    }
}
