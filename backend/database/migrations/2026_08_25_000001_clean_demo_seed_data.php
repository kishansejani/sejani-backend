<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Permanently purge any seeded dummy members (ID <= 18 or PATEL2026 family)
        try {
            DB::table('family_members')->where('user_id', '<=', 18)->delete();
            DB::table('user_profiles')->where('user_id', '<=', 18)->delete();
            DB::table('personal_records')->where('user_id', '<=', 18)->delete();
            DB::table('tractor_works')->where('user_id', '<=', 18)->delete();
            DB::table('farming_expenses')->where('user_id', '<=', 18)->delete();
            DB::table('crop_productions')->where('user_id', '<=', 18)->delete();
            DB::table('tasks')->where('user_id', '<=', 18)->delete();
            DB::table('users')->where('id', '<=', 18)->delete();
            DB::table('families')->where('family_code', 'PATEL2026')->delete();
        } catch (\Exception $e) {
            // Ignore if tables don't exist yet
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
