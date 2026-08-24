<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Farms (ખેતરો)
        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->string('name_gu'); // દા.ત. વાડી વાળું ખેતર, કુવા વાળું ખેતર
            $table->string('village')->nullable();
            $table->string('survey_number')->nullable();
            $table->decimal('area_vigha', 8, 2)->default(0); // વીઘા
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Crops (પાક)
        Schema::create('farm_crops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->foreignId('farm_id')->nullable()->constrained('farms')->onDelete('set null');
            $table->string('crop_name_gu'); // દા.ત. મગફળી, કપાસ, જીરું, ઘઉં
            $table->string('season')->default('ચોમાસુ'); // ચોમાસુ, શિયાળુ, ઉનાળુ
            $table->date('sowing_date')->nullable();
            $table->date('harvest_date')->nullable();
            $table->string('status')->default('active'); // active, harvested, sold
            $table->timestamps();
        });

        // 3. Productions & Sales (ઉત્પાદન અને વેચાણ - મણ, ખાંડી, ક્વિન્ટલ)
        Schema::create('farm_productions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->foreignId('crop_id')->nullable()->constrained('farm_crops')->onDelete('set null');
            $table->string('crop_name_gu');
            $table->decimal('quantity', 10, 2); // દા.ત. 20
            $table->string('unit'); // 'khandi' (ખાંડી), 'man' (મણ), 'kg' (કિલો), 'quintal' (ક્વિન્ટલ)
            $table->decimal('rate_per_unit', 12, 2); // દા.ત. 28000 / ખાંડી અથવા 1400 / મણ
            $table->decimal('total_amount', 14, 2); // આપોઆપ ગણતરી (quantity * rate)
            $table->decimal('equivalent_man', 10, 2)->nullable(); // મણમાં ગણતરી
            $table->decimal('equivalent_kg', 10, 2)->nullable(); // કિલોમાં ગણતરી
            $table->string('buyer_name')->nullable(); // વેપારી / માર્કેટ યાર્ડ
            $table->date('sale_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Farm Expenses (ખેતી ખર્ચ - મજૂર, ટ્રેક્ટર, ખાતર, દવા, ડીઝલ)
        Schema::create('farm_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->index();
            $table->foreignId('crop_id')->nullable()->constrained('farm_crops')->onDelete('set null');
            $table->string('expense_type'); // 'labour' (મજૂરી), 'tractor' (ટ્રેક્ટર), 'fertilizer' (ખાતર), 'medicine' (દવા), 'seeds' (બિયારણ), 'diesel' (ડીઝલ/પાણી), 'other'
            $table->string('title_gu');
            $table->decimal('amount', 12, 2);
            $table->decimal('quantity_or_hours', 8, 2)->nullable(); // દા.ત. 5 મજૂર અથવા 4 કલાક
            $table->decimal('unit_rate', 10, 2)->nullable(); // દા.ત. ₹400 / મજૂર
            $table->date('expense_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_expenses');
        Schema::dropIfExists('farm_productions');
        Schema::dropIfExists('farm_crops');
        Schema::dropIfExists('farms');
    }
};
