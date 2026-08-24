<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $devUser = User::where('phone', '9825000005')->first();
        if (!$devUser) return;

        Task::create([
            'user_id' => $devUser->id,
            'title' => 'રામભાઈ પટેલ પાસેથી ટ્રેક્ટર ભાડું ₹૧૦,૦૦૦ લેવાનું છે',
            'category' => 'payment_collect',
            'amount' => 10000,
            'task_date' => date('Y-m-d', strtotime('+1 day')),
            'task_time' => '10:00 AM',
            'is_completed' => false,
            'notes' => 'દાંતી અને રાંપનું બાકી પેમેન્ટ.',
        ]);

        Task::create([
            'user_id' => $devUser->id,
            'title' => 'વાડીની લાઈટનું બિલ ભરવાનું છે',
            'category' => 'bill_pay',
            'amount' => 3200,
            'task_date' => date('Y-m-d', strtotime('+2 days')),
            'task_time' => '11:30 AM',
            'is_completed' => false,
            'notes' => 'પીજીવીસીએલ ઓનલાઇન બિલ.',
        ]);

        Task::create([
            'user_id' => $devUser->id,
            'title' => 'કપાસમાં ઇયળ નિયંત્રણ દવા છાંટવાનું કામ',
            'category' => 'farming_work',
            'amount' => null,
            'task_date' => date('Y-m-d', strtotime('+3 days')),
            'task_time' => '07:00 AM',
            'is_completed' => false,
            'notes' => 'સવારે વહેલા પવન ન હોય ત્યારે સ્પ્રે કરવો.',
        ]);
    }
}
