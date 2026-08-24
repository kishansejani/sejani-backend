<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->string('record_type')->default('note'); // 'note', 'expense', 'document', 'reminder', 'diary'
            $table->string('title');
            $table->text('content')->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('category')->nullable(); // 'general', 'medical', 'investment', 'family_event', 'loan'
            $table->date('record_date');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_records');
    }
};
