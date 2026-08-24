<?php

namespace App\Policies;

use App\Models\PersonalRecord;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PersonalRecordPolicy
{
    /**
     * Determine whether the user can view any personal records.
     */
    public function viewAny(User $user): bool
    {
        return true; // Scoped automatically by BelongsToUser
    }

    /**
     * Determine whether the user can view the personal record.
     */
    public function view(User $user, PersonalRecord $personalRecord): Response
    {
        return (int)$user->id === (int)$personalRecord->user_id
            ? Response::allow()
            : Response::deny('આ વ્યક્તિગત રેકોર્ડ જોવાની તમારી પાસે પરવાનગી નથી. (403 Forbidden)', 403);
    }

    /**
     * Determine whether the user can create personal records.
     */
    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    /**
     * Determine whether the user can update the personal record.
     */
    public function update(User $user, PersonalRecord $personalRecord): Response
    {
        return (int)$user->id === (int)$personalRecord->user_id
            ? Response::allow()
            : Response::deny('તમે અન્ય સભ્યનો વ્યક્તિગત રેકોર્ડ બદલી શકતા નથી. (403 Forbidden)', 403);
    }

    /**
     * Determine whether the user can delete the personal record.
     */
    public function delete(User $user, PersonalRecord $personalRecord): Response
    {
        return (int)$user->id === (int)$personalRecord->user_id
            ? Response::allow()
            : Response::deny('તમે અન્ય સભ્યનો વ્યક્તિગત રેકોર્ડ ડિલીટ કરી શકતા નથી. (403 Forbidden)', 403);
    }
}
