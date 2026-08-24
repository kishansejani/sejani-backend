<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Auth\Access\Response;

class UserProfilePolicy
{
    /**
     * Anyone in the same family can view basic member profiles.
     */
    public function view(User $user, UserProfile $userProfile): Response
    {
        if ((int)$user->id === (int)$userProfile->user_id) {
            return Response::allow();
        }

        // Check if both users share at least one family
        $userFamilies = $user->families()->pluck('families.id')->toArray();
        $targetUserFamilies = $userProfile->user->families()->pluck('families.id')->toArray();

        if (count(array_intersect($userFamilies, $targetUserFamilies)) > 0) {
            return Response::allow();
        }

        return Response::deny('તમે ફક્ત તમારા પરિવારના સભ્યોની પ્રોફાઇલ જોઈ શકો છો. (403 Forbidden)', 403);
    }

    /**
     * Only the profile owner can update their profile.
     */
    public function update(User $user, UserProfile $userProfile): Response
    {
        return (int)$user->id === (int)$userProfile->user_id
            ? Response::allow()
            : Response::deny('તમે માત્ર તમારી પોતાની પ્રોફાઇલ એડિટ કરી શકો છો. (403 Forbidden)', 403);
    }
}
