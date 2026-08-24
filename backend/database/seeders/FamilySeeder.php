<?php

namespace Database\Seeders;

use App\Models\Family;
use App\Models\FamilyMember;
use App\Models\PersonalRecord;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FamilySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Main Family: "શ્રી પટેલ પરિવાર"
        $family = Family::create([
            'family_name_gu' => 'શ્રી પટેલ પરિવાર',
            'family_name_en' => 'Patel Parivar',
            'family_code' => 'PATEL2026',
            'description_gu' => 'આપણો સુખી અને સંપન્ન પરિવાર - ૧૮ સભ્યો',
        ]);

        // 2. Define 18 Family Members
        $membersData = [
            [
                'name' => 'હરિભાઈ પટેલ',
                'phone' => '9825000001',
                'email' => 'haribhai@patel.family',
                'role' => 'head',
                'relation' => 'પરિવાર મોભી / દાદા',
                'is_admin' => true,
                'birth_date' => '1952-04-12',
                'blood_group' => 'B+',
                'occupation' => 'નિવૃત્ત / વડીલ',
                'bio' => 'પરિવારના આશીર્વાદ અને માર્ગદર્શક.',
                'records' => [
                    ['title' => 'વડીલોપાર્જિત જમીન દસ્તાવેજ નં. ૪૫/૨', 'content' => 'મોજે ગામ કલોલ ખાતે આવેલી જમીનના અસલ કાગળો લોકરમાં મુકેલ છે.', 'type' => 'document', 'category' => 'general'],
                    ['title' => 'ડાયાબિટીસ દવાઓનું લિસ્ટ', 'content' => 'સવારે ભૂખ્યા પેટે એક ગોળી અને રાત્રે જમ્યા પછી.', 'type' => 'note', 'category' => 'medical'],
                ]
            ],
            [
                'name' => 'શાંતાબેન પટેલ',
                'phone' => '9825000002',
                'email' => 'shantaben@patel.family',
                'role' => 'member',
                'relation' => 'દાદી / માતૃશ્રી',
                'is_admin' => false,
                'birth_date' => '1956-08-20',
                'blood_group' => 'A+',
                'occupation' => 'ગૃહિણી',
                'bio' => 'પરિવારના સ્નેહનું કેન્દ્ર.',
                'records' => [
                    ['title' => 'પૂજાપાઠ અને વ્રત તારીખો', 'content' => 'દર પૂનમે સત્યનારાયણ કથા અને એકાદશી ઉપવાસ.', 'type' => 'note', 'category' => 'general'],
                ]
            ],
            [
                'name' => 'રમેશભાઈ પટેલ',
                'phone' => '9825000003',
                'email' => 'rameshbhai@patel.family',
                'role' => 'admin',
                'relation' => 'પિતાશ્રી (મોટા ભાઈ)',
                'is_admin' => true,
                'birth_date' => '1975-01-15',
                'blood_group' => 'O+',
                'occupation' => 'ટેક્સટાઈલ બિઝનેસ',
                'bio' => 'વેપાર અને ફેમિલી મેનેજમેન્ટ.',
                'records' => [
                    ['title' => 'દુકાન જીએસટી રિટર્ન હિસાબ', 'content' => 'Q3 રિટર્ન સમયસર ફાઈલ થઈ ગયું છે. CA સુરેશભાઈ સાથે વાત થઈ.', 'type' => 'expense', 'amount' => 45000, 'category' => 'investment'],
                    ['title' => 'નવી કાર વીમા રિન્યુઅલ', 'content' => 'પોલિસી નં. ૮૮૭૯૨ આવતા મહિને રિન્યુ કરવાની છે.', 'type' => 'reminder', 'category' => 'general'],
                ]
            ],
            [
                'name' => 'ભાવનાબેન પટેલ',
                'phone' => '9825000004',
                'email' => 'bhavnaben@patel.family',
                'role' => 'member',
                'relation' => 'માતાશ્રી',
                'is_admin' => false,
                'birth_date' => '1978-06-10',
                'blood_group' => 'B+',
                'occupation' => 'શિક્ષિકા / ગૃહિણી',
                'bio' => 'શિક્ષણ અને સંસ્કાર.',
                'records' => [
                    ['title' => 'ઘરખર્ચ બજેટ - માર્ચ', 'content' => 'કરિયાણું અને દૂધનું માસિક બિલ ચૂકવી દીધું.', 'type' => 'expense', 'amount' => 28500, 'category' => 'general'],
                ]
            ],
            [
                'name' => 'દેવ પટેલ',
                'phone' => '9825000005',
                'email' => 'dev@patel.family',
                'role' => 'admin',
                'relation' => 'પુત્ર (તમે / મુખ્ય યુઝર)',
                'is_admin' => true,
                'birth_date' => '1998-11-25',
                'blood_group' => 'O+',
                'occupation' => 'સોફ્ટવેર એન્જિનિયર',
                'bio' => 'ટેકનોલોજી અને ફેમિલી એપ ડેવલપર.',
                'records' => [
                    ['title' => 'પર્સનલ મ્યુચ્યુઅલ ફંડ SIP હિસાબ', 'content' => 'દર મહિને ₹15,000 નિફ્ટી 50 ઇન્ડેક્સ અને મિડકેપમાં રોકાણ.', 'type' => 'expense', 'amount' => 15000, 'category' => 'investment'],
                    ['title' => 'ક્લાઉડ સર્વર ક્રેડેન્શિયલ્સ & બેકઅપ કી', 'content' => 'AWS અને Laravel બેકઅપ એન્ક્રિપ્શન કી સુરક્ષિત રખાયેલ છે.', 'type' => 'document', 'category' => 'general'],
                    ['title' => 'રોજિંદી ડાયરી - નવી પ્રોડક્ટ લોન્ચ', 'content' => 'આજે ફેમિલી એપનું પ્રથમ વર્ઝન સફળતાપૂર્વક તૈયાર થયું!', 'type' => 'diary', 'category' => 'general'],
                ]
            ],
            [
                'name' => 'પ્રિયા પટેલ',
                'phone' => '9825000006',
                'email' => 'priya@patel.family',
                'role' => 'member',
                'relation' => 'પુત્રી / બહેન',
                'is_admin' => false,
                'birth_date' => '2001-03-18',
                'blood_group' => 'A+',
                'occupation' => 'આર્કિટેક્ટ ડિઝાઇનર',
                'bio' => 'ડિઝાઇનિંગ અને ટ્રાવેલિંગ.',
                'records' => [
                    ['title' => 'લેપટોપ ખરીદી ઇએમઆઈ', 'content' => 'મેકબુક પ્રો EMI દર મહિને ૫ તારીખે કપાશે.', 'type' => 'expense', 'amount' => 8200, 'category' => 'investment'],
                ]
            ],
            [
                'name' => 'મુકેશભાઈ પટેલ',
                'phone' => '9825000007',
                'email' => 'mukeshbhai@patel.family',
                'role' => 'member',
                'relation' => 'કાકાશ્રી (નાના ભાઈ)',
                'is_admin' => false,
                'birth_date' => '1979-09-05',
                'blood_group' => 'AB+',
                'occupation' => 'કૃષિ અને ફાર્મિંગ',
                'bio' => 'ઓર્ગેનિક ખેતી અને વાડી મેનેજમેન્ટ.',
                'records' => [
                    ['title' => 'ટ્રેક્ટર સર્વિસિંગ અને ડીઝલ ખર્ચ', 'content' => 'નવી સીઝન માટે બિયારણ અને ટ્રેક્ટર સર્વિસિંગ પૂરું કર્યું.', 'type' => 'expense', 'amount' => 18000, 'category' => 'general'],
                ]
            ],
            [
                'name' => 'ગીતાબેન પટેલ',
                'phone' => '9825000008',
                'email' => 'gitaben@patel.family',
                'role' => 'member',
                'relation' => 'કાકીશ્રી',
                'is_admin' => false,
                'birth_date' => '1982-12-14',
                'blood_group' => 'B+',
                'occupation' => 'ગૃહિણી',
                'bio' => 'રસોઈકળા અને સેવા.',
                'records' => [
                    ['title' => 'સોનાના દાગીના બેંક લોકર રસીદ', 'content' => 'બેંક ઓફ બરોડા લોકર નંબર 114.', 'type' => 'document', 'category' => 'investment'],
                ]
            ],
            [
                'name' => 'યશ પટેલ',
                'phone' => '9825000009',
                'email' => 'yash@patel.family',
                'role' => 'member',
                'relation' => 'પિતરાઈ ભાઈ (કાકાનો દીકરો)',
                'is_admin' => false,
                'birth_date' => '2004-07-22',
                'blood_group' => 'O+',
                'occupation' => 'કોલેજ વિદ્યાર્થી (B.Tech)',
                'bio' => 'સ્પોર્ટ્સ અને ગેમિંગ.',
                'records' => [
                    ['title' => 'કોલેજ સેમેસ્ટર ૫ ફી', 'content' => 'ટર્મ ફી જમા કરાવી દીધી છે.', 'type' => 'expense', 'amount' => 55000, 'category' => 'general'],
                ]
            ],
            [
                'name' => 'દિયા પટેલ',
                'phone' => '9825000010',
                'email' => 'diya@patel.family',
                'role' => 'member',
                'relation' => 'પિતરાઈ બહેન (કાકાની દીકરી)',
                'is_admin' => false,
                'birth_date' => '2007-02-11',
                'blood_group' => 'A+',
                'occupation' => 'વિદ્યાર્થીની (ધોરણ ૧૨)',
                'bio' => 'ચિત્રકળા અને અભ્યાસ.',
                'records' => [
                    ['title' => 'બોર્ડ પરીક્ષા ટાઈમટેબલ', 'content' => 'મેથ્સ અને ફિઝિક્સ રિવિઝન પ્લાન.', 'type' => 'note', 'category' => 'general'],
                ]
            ],
            [
                'name' => 'હંસાબેન પટેલ',
                'phone' => '9825000011',
                'email' => 'hansaben@patel.family',
                'role' => 'member',
                'relation' => 'ફોઈશ્રી',
                'is_admin' => false,
                'birth_date' => '1973-10-30',
                'blood_group' => 'B+',
                'occupation' => 'ગૃહિણી',
                'bio' => 'અમદાવાદ નિવાસી.',
                'records' => []
            ],
            [
                'name' => 'જયેશભાઈ પટેલ',
                'phone' => '9825000012',
                'email' => 'jayeshbhai@patel.family',
                'role' => 'member',
                'relation' => 'ફુવાશ્રી',
                'is_admin' => false,
                'birth_date' => '1970-05-19',
                'blood_group' => 'O+',
                'occupation' => 'વેપારી',
                'bio' => 'અમદાવાદ.',
                'records' => []
            ],
            [
                'name' => 'પારસ પટેલ',
                'phone' => '9825000013',
                'email' => 'paras@patel.family',
                'role' => 'member',
                'relation' => 'ભાણેજ ભાઈ',
                'is_admin' => false,
                'birth_date' => '1996-08-14',
                'blood_group' => 'A+',
                'occupation' => 'ફાઇનાન્સ મેનેજર',
                'bio' => 'શેરબજાર અને ઇન્વેસ્ટમેન્ટ.',
                'records' => []
            ],
            [
                'name' => 'શ્રદ્ધા પટેલ',
                'phone' => '9825000014',
                'email' => 'shraddha@patel.family',
                'role' => 'member',
                'relation' => 'ભાણેજ બહેન',
                'is_admin' => false,
                'birth_date' => '1999-12-01',
                'blood_group' => 'O+',
                'occupation' => 'ડોક્ટર (MBBS)',
                'bio' => 'મેડિકલ સેવા.',
                'records' => []
            ],
            [
                'name' => 'કિરીટભાઈ પટેલ',
                'phone' => '9825000015',
                'email' => 'kiritbhai@patel.family',
                'role' => 'member',
                'relation' => 'મામાશ્રી',
                'is_admin' => false,
                'birth_date' => '1976-04-08',
                'blood_group' => 'B+',
                'occupation' => 'ડાયમંડ વેપારી',
                'bio' => 'સુરત.',
                'records' => []
            ],
            [
                'name' => 'મીનાબેન પટેલ',
                'phone' => '9825000016',
                'email' => 'minaben@patel.family',
                'role' => 'member',
                'relation' => 'મામીશ્રી',
                'is_admin' => false,
                'birth_date' => '1980-09-17',
                'blood_group' => 'A+',
                'occupation' => 'ગૃહિણી',
                'bio' => 'સુરત.',
                'records' => []
            ],
            [
                'name' => 'આરવ પટેલ',
                'phone' => '9825000017',
                'email' => 'aarav@patel.family',
                'role' => 'member',
                'relation' => 'નાનો પુત્ર / ભત્રીજો',
                'is_admin' => false,
                'birth_date' => '2014-06-25',
                'blood_group' => 'O+',
                'occupation' => 'વિદ્યાર્થી (ધોરણ ૬)',
                'bio' => 'ક્રિકેટ પ્રેમી.',
                'records' => []
            ],
            [
                'name' => 'અનન્યા પટેલ',
                'phone' => '9825000018',
                'email' => 'ananya@patel.family',
                'role' => 'member',
                'relation' => 'નાની પુત્રી / ભત્રીજી',
                'is_admin' => false,
                'birth_date' => '2017-09-12',
                'blood_group' => 'B+',
                'occupation' => 'વિદ્યાર્થીની (ધોરણ ૩)',
                'bio' => 'ડાન્સ અને મસ્તી.',
                'records' => []
            ],
        ];

        // 3. Create all Users, Profiles, Family Relationships, and Isolated Personal Records
        $headUser = null;
        $defaultPassword = Hash::make('password123'); // Default password for test users

        foreach ($membersData as $index => $data) {
            $user = User::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'password' => $defaultPassword,
                'role' => $data['role'],
                'status' => 'active',
            ]);

            if ($index === 0) {
                $headUser = $user;
            }

            UserProfile::create([
                'user_id' => $user->id,
                'full_name_gu' => $data['name'],
                'full_name_en' => null,
                'birth_date' => $data['birth_date'],
                'blood_group' => $data['blood_group'],
                'occupation_gu' => $data['occupation'],
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($data['name']) . '&background=1E3A8A&color=F59E0B&size=200',
                'bio_gu' => $data['bio'],
                'emergency_contact' => '9825000001',
            ]);

            FamilyMember::create([
                'family_id' => $family->id,
                'user_id' => $user->id,
                'relation_title_gu' => $data['relation'],
                'is_admin' => $data['is_admin'],
            ]);

            // Add private records for this user (User Isolation test data)
            if (!empty($data['records'])) {
                foreach ($data['records'] as $rec) {
                    PersonalRecord::create([
                        'user_id' => $user->id,
                        'record_type' => $rec['type'],
                        'title' => $rec['title'],
                        'content' => $rec['content'],
                        'amount' => $rec['amount'] ?? null,
                        'category' => $rec['category'] ?? 'general',
                        'record_date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                        'is_pinned' => false,
                        'is_locked' => false,
                    ]);
                }
            }
        }

        // Set Head User on Family
        if ($headUser) {
            $family->head_user_id = $headUser->id;
            $family->save();
        }
    }
}
