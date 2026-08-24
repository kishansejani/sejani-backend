<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('families', function (Blueprint $table) {
            $table->id();
            $table->string('family_name_gu');
            $table->string('family_name_en')->nullable();
            $table->string('family_code')->unique();
            $table->foreignId('head_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('description_gu')->nullable();
            $table->timestamps();
        });

        Schema::create('family_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained('families')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('relation_title_gu'); // e.g. મોભી/દાદા, પિતા, માતા, પુત્ર, કાકા
            $table->boolean('is_admin')->default(false);
            $table->timestamps();

            $table->unique(['family_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_members');
        Schema::dropIfExists('families');
    }
};
