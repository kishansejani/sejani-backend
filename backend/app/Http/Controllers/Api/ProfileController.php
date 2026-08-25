<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\FcmToken;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'full_name_gu' => 'required|string|max:100',
            'full_name_en' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'blood_group' => 'nullable|string|max:10',
            'occupation_gu' => 'nullable|string|max:100',
            'avatar' => 'nullable|string',
            'bio_gu' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:20',
            'relation_title_gu' => 'nullable|string|max:100',
        ], [
            'full_name_gu.required' => 'પૂરું નામ (ગુજરાતીમાં) દાખલ કરવું જરૂરી છે.',
        ]);

        $profileData = collect($validated)->except(['relation_title_gu'])->toArray();
        $profile = UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        if ($request->filled('full_name_gu')) {
            $user->name = $request->full_name_gu;
            $user->save();
        }

        if ($request->filled('relation_title_gu')) {
            $relation = $request->relation_title_gu;
            $family = $user->families()->first() ?? \App\Models\Family::first();
            if ($family) {
                if ($user->families()->where('families.id', $family->id)->exists()) {
                    $user->families()->updateExistingPivot($family->id, [
                        'relation_title_gu' => $relation,
                    ]);
                } else {
                    $user->families()->attach($family->id, [
                        'relation_title_gu' => $relation,
                        'is_admin' => false,
                    ]);
                }
            }
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'profile_updated',
            'details' => 'પ્રોફાઇલ વિગતો અપડેટ થઈ.',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ.',
            'user' => new UserResource($user->fresh(['profile', 'families'])),
        ]);
    }
}
