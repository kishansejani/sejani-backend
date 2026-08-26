<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('families')) {
                $dummyFamilies = \Illuminate\Support\Facades\DB::table('families')
                    ->where('family_code', 'PATEL2026')
                    ->orWhere('family_name_gu', 'LIKE', '%પટેલ પરિવાર%')
                    ->orWhere('id', 1)
                    ->pluck('id')
                    ->toArray();

                if (!empty($dummyFamilies)) {
                    \Illuminate\Support\Facades\DB::table('family_members')->whereIn('family_id', $dummyFamilies)->delete();
                    \Illuminate\Support\Facades\DB::table('families')->whereIn('id', $dummyFamilies)->delete();
                }

                \Illuminate\Support\Facades\DB::table('users')->where('id', '<=', 18)->where('phone', 'LIKE', '98250000%')->delete();
            }
        } catch (\Throwable $e) {
            // Safe fallback
        }
    }
}
