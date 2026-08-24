<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\FarmCrop;
use App\Models\FarmExpense;
use App\Models\FarmProduction;
use App\Models\TractorWork;
use App\Models\User;
use Illuminate\Database\Seeder;

class FarmingSeeder extends Seeder
{
    public function run(): void
    {
        $devUser = User::where('phone', '9825000005')->first();
        if (!$devUser) return;

        // 1. Create Farms
        $farm1 = Farm::create([
            'user_id' => $devUser->id,
            'name_gu' => 'વાડી વાળું મોટું ખેતર',
            'village' => 'કલોલ',
            'survey_number' => '૪૫/૨',
            'area_vigha' => 12.5,
            'notes' => 'બોર અને ટપક પદ્ધતિ સાથે.',
        ]);

        // 2. Create Crops
        $crop1 = FarmCrop::create([
            'user_id' => $devUser->id,
            'farm_id' => $farm1->id,
            'crop_name_gu' => 'મગફળી (જી-૨૦)',
            'season' => 'ચોમાસુ',
            'sowing_date' => '2026-06-15',
            'status' => 'harvested',
        ]);

        // 3. Create Productions (20 ખાંડી મગફળી @ 28000 = ₹5,60,000)
        FarmProduction::create([
            'user_id' => $devUser->id,
            'crop_id' => $crop1->id,
            'crop_name_gu' => 'મગફળી',
            'quantity' => 20,
            'unit' => 'khandi', // ૨૦ ખાંડી
            'rate_per_unit' => 28000,
            'total_amount' => 560000,
            'equivalent_man' => 400, // ૪૦૦ મણ
            'equivalent_kg' => 8000, // ૮૦૦૦ કિલો
            'buyer_name' => 'ગોંડલ માર્કેટ યાર્ડ',
            'sale_date' => '2026-08-10',
            'notes' => 'પેમેન્ટ ચૂકતે.',
        ]);

        // 4. Create Tractor Custom Works for Ram Bhai (૧૦ વીઘા: ૨ વાર દાંતી, ૧ વાર માઢ, ૨ વાર રાંપ)
        TractorWork::create([
            'user_id' => $devUser->id,
            'work_category' => 'customer',
            'customer_name' => 'રામભાઈ પટેલ',
            'customer_phone' => '9825012345',
            'operation_type' => 'દાંતી',
            'trips_count' => 2, // ૨ વાર દાંતી
            'calc_basis' => 'vigha',
            'units_count' => 10, // ૧૦ વીઘા
            'rate_per_unit' => 350, // ₹૩૫૦ / વીઘા
            'total_amount' => 7000, // ૨ × ૧૦ × ૩૫૦ = ₹૭,૦૦૦
            'payment_status' => 'pending',
            'work_date' => '2026-08-14',
            'notes' => 'પ્રથમ ખેડ દાંતી.',
        ]);

        TractorWork::create([
            'user_id' => $devUser->id,
            'work_category' => 'customer',
            'customer_name' => 'રામભાઈ પટેલ',
            'customer_phone' => '9825012345',
            'operation_type' => 'માઢ',
            'trips_count' => 1, // ૧ વાર માઢ
            'calc_basis' => 'vigha',
            'units_count' => 10,
            'rate_per_unit' => 350,
            'total_amount' => 3500, // ૧ × ૧૦ × ૩૫૦ = ₹૩,૫૦૦
            'payment_status' => 'pending',
            'work_date' => '2026-08-16',
            'notes' => 'માઢ વાળવાનું કામ.',
        ]);

        TractorWork::create([
            'user_id' => $devUser->id,
            'work_category' => 'customer',
            'customer_name' => 'રામભાઈ પટેલ',
            'customer_phone' => '9825012345',
            'operation_type' => 'રાંપ',
            'trips_count' => 2, // ૨ વાર રાંપ
            'calc_basis' => 'vigha',
            'units_count' => 10,
            'rate_per_unit' => 350,
            'total_amount' => 7000, // ૨ × ૧૦ × ૩૫૦ = ₹૭,૦૦૦
            'payment_status' => 'pending',
            'work_date' => '2026-08-18',
            'notes' => 'રાંપ હાંકવાનું કામ.',
        ]);

        // Total Ram Bhai Bill = 7000 + 3500 + 7000 = ₹17,500
    }
}
