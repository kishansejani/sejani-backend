<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Family;
use App\Models\FamilyMember;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            // 1. Find and delete any PATEL2026 or demo 'શ્રી પટેલ પરિવાર' families
            $demoFamilyIds = DB::table('families')
                ->where('family_code', 'PATEL2026')
                ->orWhere('family_name_gu', 'LIKE', '%પટેલ પરિવાર%')
                ->pluck('id')
                ->toArray();

            if (!empty($demoFamilyIds)) {
                DB::table('family_members')->whereIn('family_id', $demoFamilyIds)->delete();
                DB::table('families')->whereIn('id', $demoFamilyIds)->delete();
            }

            // 2. Delete any orphaned family_members records
            $validFamilyIds = DB::table('families')->pluck('id')->toArray();
            DB::table('family_members')->whereNotIn('family_id', $validFamilyIds)->delete();

            // 3. Ensure EVERY user has their own private family with only themselves
            $users = User::all();
            foreach ($users as $user) {
                $hasFamily = DB::table('family_members')->where('user_id', $user->id)->exists();
                if (!$hasFamily) {
                    $familyNameGu = ($user->name ?? 'મારો') . ' પરિવાર';
                    $familyNameEn = ($user->name ?? 'My') . ' Family';
                    $familyCode = 'FAM' . rand(10000, 99999);

                    $familyId = DB::table('families')->insertGetId([
                        'family_name_gu' => $familyNameGu,
                        'family_name_en' => $familyNameEn,
                        'family_code' => $familyCode,
                        'head_user_id' => $user->id,
                        'description_gu' => 'અંગત અને પારિવારિક ખાતું',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('family_members')->insert([
                        'family_id' => $familyId,
                        'user_id' => $user->id,
                        'relation_title_gu' => 'મોભી',
                        'is_admin' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Ignore in case of fresh DB
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
