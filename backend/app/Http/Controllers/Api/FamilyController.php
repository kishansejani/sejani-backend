<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FamilyMemberResource;
use App\Http\Resources\UserResource;
use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FamilyController extends Controller
{
    /**
     * Get the family details of the logged in user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $family = $user->families()->first();

        // If user was attached to old demo PATEL2026 family, purge it and create fresh personal family
        if ($family && $family->family_code === 'PATEL2026') {
            FamilyMember::where('family_id', $family->id)->delete();
            $family->delete();
            $family = null;
        }

        if (!$family) {
            $familyNameGu = ($user->name ?? 'મારો') . ' પરિવાર';
            $familyNameEn = ($user->name ?? 'My') . ' Family';
            $familyCode = 'FAM' . rand(10000, 99999);

            $family = Family::create([
                'family_name_gu' => $familyNameGu,
                'family_name_en' => $familyNameEn,
                'family_code' => $familyCode,
                'head_user_id' => $user->id,
                'description_gu' => 'અંગત અને પારિવારિક ખાતું',
            ]);

            FamilyMember::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'relation_title_gu' => 'મોભી',
                'is_admin' => true,
            ]);
        }

        $members = FamilyMember::with(['user.profile'])
            ->where('family_id', $family->id)
            ->get();

        return response()->json([
            'family' => [
                'id' => $family->id,
                'name_gu' => $family->family_name_gu,
                'name_en' => $family->family_name_en,
                'family_code' => $family->family_code,
                'description_gu' => $family->description_gu,
                'total_members' => $members->count(),
            ],
            'members' => FamilyMemberResource::collection($members),
        ]);
    }

    /**
     * Get a specific member's public family profile.
     */
    public function memberDetails(Request $request, int $userId)
    {
        $currentUser = $request->user();
        
        // Find if target user is in the same family
        $userFamilyIds = $currentUser->families()->pluck('families.id')->toArray();
        $targetMember = FamilyMember::whereIn('family_id', $userFamilyIds)
            ->where('user_id', $userId)
            ->with(['user.profile', 'family'])
            ->first();

        if (!$targetMember) {
            return response()->json([
                'message' => 'આ સભ્ય તમારા પરિવારમાં નથી. (403 Forbidden)',
            ], 403);
        }

        return response()->json([
            'member' => new FamilyMemberResource($targetMember),
        ]);
    }

    /**
     * Add a new member to the current user's family.
     */
    public function addMember(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
            'password' => 'nullable|string|min:6',
            'relation_title_gu' => 'nullable|string',
        ], [
            'name.required' => 'સભ્યનું નામ દાખલ કરો.',
            'phone.required' => 'મોબાઈલ નંબર દાખલ કરવો જરૂરી છે.',
        ]);

        $currentUser = $request->user();
        $family = $currentUser->families()->first();

        if (!$family) {
            // Create family if none exists
            $family = Family::create([
                'family_name_gu' => $currentUser->name . 'નો પરિવાર',
                'family_name_en' => $currentUser->name . "'s Family",
                'family_code' => 'FAM' . rand(10000, 99999),
                'head_user_id' => $currentUser->id,
                'description_gu' => 'અંગત અને પારિવારિક ખાતું',
            ]);
            $currentUser->families()->attach($family->id, ['relation_title_gu' => 'મોભી', 'is_admin' => true]);
        }

        // Check if user already exists
        $user = User::where('phone', $validated['phone'])->first();
        if (!$user) {
            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password'] ?? '123456'),
                'status' => 'active',
            ]);

            \App\Models\UserProfile::create([
                'user_id' => $user->id,
                'full_name_gu' => $validated['name'],
                'role_in_family' => $validated['relation_title_gu'] ?? 'member',
                'relationship_to_head' => $validated['relation_title_gu'] ?? 'સભ્ય',
            ]);
        }

        // Check if member already in family
        $alreadyInFamily = FamilyMember::where('family_id', $family->id)
            ->where('user_id', $user->id)
            ->first();

        if ($alreadyInFamily) {
            return response()->json([
                'message' => 'આ સભ્ય પહેલેથી જ તમારા પરિવારમાં ઉમેરાયેલા છે.',
            ], 422);
        }

        $newMember = FamilyMember::create([
            'family_id' => $family->id,
            'user_id' => $user->id,
            'relation_title_gu' => $validated['relation_title_gu'] ?? 'સભ્ય',
            'is_admin' => false,
        ]);

        return response()->json([
            'message' => 'નવા પરિવાર સભ્ય સફળતાપૂર્વક ઉમેરાઈ ગયા!',
            'member' => new FamilyMemberResource($newMember->load(['user.profile', 'family'])),
        ], 201);
    }

    /**
     * Delete / Remove a member from family
     */
    public function deleteMember(Request $request, int $id)
    {
        $currentUser = $request->user();
        $family = $currentUser->families()->first();

        if (!$family) {
            return response()->json(['message' => 'પરિવાર મળ્યો નહીં.'], 404);
        }

        $member = FamilyMember::where('family_id', $family->id)
            ->where('id', $id)
            ->first();

        if (!$member) {
            // Also try by user_id
            $member = FamilyMember::where('family_id', $family->id)
                ->where('user_id', $id)
                ->first();
        }

        if ($member) {
            $member->delete();
            return response()->json(['message' => 'સભ્ય પરિવારમાંથી રદ કર્યો.']);
        }

        return response()->json(['message' => 'સભ્ય મળ્યો નહીં.'], 404);
    }
}
