<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tasks & Time-based Alerts / Reminders (પેમેન્ટ લેવાનું, બિલ ભરવાનું, ખેતી કામ)
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->string('title'); // દા.ત. રામભાઈ પાસેથી ₹૧૦,૦૦૦ લેવાના, લાઈટ બિલ ભરવાનું
            $table->string('category')->default('payment_collect'); // 'payment_collect', 'bill_pay', 'farming_work', 'vehicle', 'general'
            $table->decimal('amount', 12, 2)->nullable();
            $table->date('task_date'); // દા.ત. 2026-08-25
            $table->string('task_time')->nullable(); // દા.ત. 10:00 AM
            $table->dateTime('reminder_datetime')->nullable(); // ચોક્કસ સમય જ્યારે એલર્ટ આવે
            $table->boolean('is_completed')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
