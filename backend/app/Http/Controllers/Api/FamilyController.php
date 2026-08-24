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

        if (!$family) {
            return response()->json([
                'family' => null,
                'members' => [],
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
}
