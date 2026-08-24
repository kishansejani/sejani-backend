<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tractor Custom Work & Billing (બીજાના ખેતરમાં હાંકવાનું કામ + પોતાના ખેતરનો હિસાબ)
        Schema::create('tractor_works', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->string('work_category')->default('customer'); // 'customer' (બીજાનું કામ/આવક), 'self' (પોતાનું ખેતર/ખર્ચ)
            $table->string('customer_name')->nullable(); // દા.ત. રામભાઈ, સુરેશભાઈ
            $table->string('customer_phone')->nullable();
            $table->string('operation_type'); // 'દાંતી', 'રાંપ', 'માઢ', 'સાવડા', 'માંડવી પાડવા', 'રોટાવેટર', 'થ્રેસર', 'ટ્રોલી ભાડું'
            $table->integer('trips_count')->default(1); // ૧ વાર, ૨ વાર, ૩ વાર
            $table->string('calc_basis')->default('vigha'); // 'vigha' (વીઘા), 'hours' (કલાક), 'trips' (ફેરા)
            $table->decimal('units_count', 8, 2); // દા.ત. ૧૦ વીઘા અથવા ૪ કલાક
            $table->decimal('rate_per_unit', 10, 2); // દા.ત. ₹૩૫૦ / વીઘા અથવા ₹૮૦૦ / કલાક
            $table->decimal('total_amount', 12, 2); // (trips * units * rate)
            $table->string('payment_status')->default('pending'); // 'paid', 'pending', 'partial'
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->date('work_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tractor_works');
    }
};
