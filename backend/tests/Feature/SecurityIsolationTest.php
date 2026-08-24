<?php

namespace Tests\Feature;

use App\Models\PersonalRecord;
use App\Models\User;
use Database\Seeders\FamilySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(FamilySeeder::class);
    }

    public function test_user_can_only_see_their_own_personal_records()
    {
        $user1 = User::where('phone', '9825000005')->first(); // Dev Patel
        $user2 = User::where('phone', '9825000003')->first(); // Ramesh Patel

        // User 1 creates a secret record
        $this->actingAs($user1);
        $recordUser1 = PersonalRecord::create([
            'title' => 'દેવની અત્યંત ખાનગી નોંધ',
            'content' => 'આ નોંધ કોઈ બીજા જોઈ શકશે નહીં.',
            'record_type' => 'note',
            'record_date' => now()->toDateString(),
        ]);

        $this->assertEquals($user1->id, $recordUser1->user_id);

        // User 2 logs in and tries to access User 1 record
        $this->actingAs($user2);
        
        // 1. User 2 index list should NOT include User 1 record
        $response = $this->getJson('/api/personal-records');
        $response->assertStatus(200);
        $data = $response->json('data');
        $ids = array_column($data, 'id');
        $this->assertNotContains($recordUser1->id, $ids);

        // 2. Direct GET on User 1 record by User 2 returns 403 Forbidden
        $showResponse = $this->getJson('/api/personal-records/' . $recordUser1->id);
        $showResponse->assertStatus(403);

        // 3. Direct DELETE on User 1 record by User 2 returns 403 Forbidden
        $deleteResponse = $this->deleteJson('/api/personal-records/' . $recordUser1->id);
        $deleteResponse->assertStatus(403);

        // 4. Record still exists in database
        $this->assertDatabaseHas('personal_records', [
            'id' => $recordUser1->id,
            'user_id' => $user1->id,
        ]);
    }

    public function test_user_id_in_request_payload_is_strictly_ignored()
    {
        $user = User::where('phone', '9825000005')->first();
        $this->actingAs($user);

        // Attacking payload: trying to forge user_id = 9999
        $response = $this->postJson('/api/personal-records', [
            'user_id' => 9999,
            'title' => 'ટેસ્ટ નોંધ',
            'record_type' => 'note',
            'record_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201);
        $recordId = $response->json('record.id');

        // Verify that database record was created with auth()->id() (user->id) and NOT 9999
        $this->assertDatabaseHas('personal_records', [
            'id' => $recordId,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseMissing('personal_records', [
            'id' => $recordId,
            'user_id' => 9999,
        ]);
    }
}
