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
    private function normalizePhone(string $phone): string
    {
        // Convert Gujarati numerals to English (૦-૯ -> 0-9)
        $gujaratiNumbers = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
        $englishNumbers  = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $phone = str_replace($gujaratiNumbers, $englishNumbers, $phone);

        // Remove all non-digit characters
        $digits = preg_replace('/\D/', '', $phone);

        // Normalize 10-digit Indian numbers from +91 or leading 0
        if (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            $digits = substr($digits, 2);
        } elseif (strlen($digits) === 11 && str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        return !empty($digits) ? $digits : trim($phone);
    }

    public function register(Request $request)
    {
        if ($request->has('phone')) {
            $request->merge(['phone' => $this->normalizePhone((string) $request->phone)]);
        }

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

        $user = \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => trim($validated['name']),
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password'], ['rounds' => 10]),
                'status' => 'active',
            ]);

            // Create Profile
            \App\Models\UserProfile::create([
                'user_id' => $user->id,
                'full_name_gu' => trim($validated['name']),
            ]);

            // Create an isolated personal family specifically for this user
            $familyNameGu = trim($validated['name']) . 'નો પરિવાર';
            $familyNameEn = trim($validated['name']) . "'s Family";
            $familyCode = 'FAM' . rand(10000, 99999);

            $family = \App\Models\Family::create([
                'family_name_gu' => $familyNameGu,
                'family_name_en' => $familyNameEn,
                'family_code' => $familyCode,
                'head_user_id' => $user->id,
                'description_gu' => 'અંગત અને પારિવારિક ખાતું',
            ]);

            $user->families()->attach($family->id, [
                'relation_title_gu' => $validated['relationship'] ?? 'મોભી',
                'is_admin' => true,
            ]);

            return $user;
        });

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

        $rawInput = trim((string) $request->input('login'));
        $cleanPhone = $this->normalizePhone($rawInput);

        // Look up by phone (cleaned or raw) or email
        $user = User::where('phone', $cleanPhone)
            ->orWhere('phone', $rawInput)
            ->orWhere('email', $rawInput)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed attempt
            AuditLog::create([
                'user_id' => $user?->id,
                'action' => 'unauthorized_login_attempt',
                'details' => 'ખોટો પાસવર્ડ અથવા મોબાઈલ: ' . $rawInput . ' (Cleaned: ' . $cleanPhone . ')',
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
