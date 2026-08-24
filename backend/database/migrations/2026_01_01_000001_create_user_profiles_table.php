<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('full_name_gu');
            $table->string('full_name_en')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('blood_group', 10)->nullable();
            $table->string('occupation_gu')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio_gu')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
