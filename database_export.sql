-- Database SQL Dump for TablePlus & Database Tools
-- Database: personal
-- Generated: 2026-08-26 13:28:43

-- --------------------------------------------------------
-- Table structure & data for table `migrations`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE "migrations" ("id" integer primary key autoincrement not null, "migration" varchar not null, "batch" integer not null);

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('1', '0001_01_01_000000_create_users_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('2', '0001_01_01_000001_create_cache_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('3', '0001_01_01_000002_create_jobs_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('4', '2026_01_01_000001_create_user_profiles_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('5', '2026_01_01_000002_create_families_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('6', '2026_01_01_000003_create_personal_records_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('7', '2026_01_01_000004_create_fcm_tokens_and_audit_logs_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('8', '2026_08_24_072652_create_personal_access_tokens_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('9', '2026_01_01_000005_create_farming_tables', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('10', '2026_01_01_000006_create_tractor_works_table', '3');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('11', '2026_01_01_000007_create_tasks_table', '4');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('12', '2026_08_25_000001_clean_demo_seed_data', '5');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('13', '2026_08_26_000001_fix_orphaned_family_members', '6');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('14', '2026_08_26_000002_wipe_dummy_patel_family', '7');

-- --------------------------------------------------------
-- Table structure & data for table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE "users" ("id" integer primary key autoincrement not null, "name" varchar, "phone" varchar not null, "email" varchar, "email_verified_at" datetime, "password" varchar not null, "role" varchar not null default 'member', "status" varchar not null default 'active', "remember_token" varchar, "created_at" datetime, "updated_at" datetime);

INSERT INTO `users` (`id`, `name`, `phone`, `email`, `email_verified_at`, `password`, `role`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES ('19', 'Kishan Sejani Test', '9898989898', NULL, NULL, '$2y$12$KHBzHMW.6xGKKOQgSpkMyen7jMz6LjmS11qX6znxkaxIbkb2qYKli', 'member', 'active', NULL, '2026-08-24 14:35:24', '2026-08-24 14:35:24');
INSERT INTO `users` (`id`, `name`, `phone`, `email`, `email_verified_at`, `password`, `role`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES ('20', 'New User Test', '9865266566', NULL, NULL, '$2y$12$A3WBSUlsz9fjN15K/jBk/.GGLx2CoSoRHy0lHLLC6IsblBf1uOSRO', 'member', 'active', NULL, '2026-08-24 14:52:24', '2026-08-24 14:52:24');
INSERT INTO `users` (`id`, `name`, `phone`, `email`, `email_verified_at`, `password`, `role`, `status`, `remember_token`, `created_at`, `updated_at`) VALUES ('21', 'Kishan Live Test', '9819847105', NULL, NULL, '$2y$12$/nJx3rVzG5d4k4WOfCFE6.KOIcJfGSJfPULd2LGVowe3C7rmhH.52', 'member', 'active', NULL, '2026-08-24 14:52:42', '2026-08-24 14:52:42');

-- --------------------------------------------------------
-- Table structure & data for table `password_reset_tokens`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE "password_reset_tokens" ("email" varchar not null, "token" varchar not null, "created_at" datetime, primary key ("email"));

-- --------------------------------------------------------
-- Table structure & data for table `sessions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE "sessions" ("id" varchar not null, "user_id" integer, "ip_address" varchar, "user_agent" text, "payload" text not null, "last_activity" integer not null, primary key ("id"));

-- --------------------------------------------------------
-- Table structure & data for table `cache`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `cache`;
CREATE TABLE "cache" ("key" varchar not null, "value" text not null, "expiration" integer not null, primary key ("key"));

-- --------------------------------------------------------
-- Table structure & data for table `cache_locks`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE "cache_locks" ("key" varchar not null, "owner" varchar not null, "expiration" integer not null, primary key ("key"));

-- --------------------------------------------------------
-- Table structure & data for table `jobs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE "jobs" ("id" integer primary key autoincrement not null, "queue" varchar not null, "payload" text not null, "attempts" integer not null, "reserved_at" integer, "available_at" integer not null, "created_at" integer not null);

-- --------------------------------------------------------
-- Table structure & data for table `job_batches`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE "job_batches" ("id" varchar not null, "name" varchar not null, "total_jobs" integer not null, "pending_jobs" integer not null, "failed_jobs" integer not null, "failed_job_ids" text not null, "options" text, "cancelled_at" integer, "created_at" integer not null, "finished_at" integer, primary key ("id"));

-- --------------------------------------------------------
-- Table structure & data for table `failed_jobs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE "failed_jobs" ("id" integer primary key autoincrement not null, "uuid" varchar not null, "connection" text not null, "queue" text not null, "payload" text not null, "exception" text not null, "failed_at" datetime not null default CURRENT_TIMESTAMP);

-- --------------------------------------------------------
-- Table structure & data for table `user_profiles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE "user_profiles" ("id" integer primary key autoincrement not null, "user_id" integer not null, "full_name_gu" varchar not null, "full_name_en" varchar, "birth_date" date, "blood_group" varchar, "occupation_gu" varchar, "avatar" varchar, "bio_gu" text, "emergency_contact" varchar, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade);

INSERT INTO `user_profiles` (`id`, `user_id`, `full_name_gu`, `full_name_en`, `birth_date`, `blood_group`, `occupation_gu`, `avatar`, `bio_gu`, `emergency_contact`, `created_at`, `updated_at`) VALUES ('19', '19', 'Kishan Sejani Test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-24 14:35:24', '2026-08-24 14:35:24');
INSERT INTO `user_profiles` (`id`, `user_id`, `full_name_gu`, `full_name_en`, `birth_date`, `blood_group`, `occupation_gu`, `avatar`, `bio_gu`, `emergency_contact`, `created_at`, `updated_at`) VALUES ('20', '20', 'New User Test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-24 14:52:24', '2026-08-24 14:52:24');
INSERT INTO `user_profiles` (`id`, `user_id`, `full_name_gu`, `full_name_en`, `birth_date`, `blood_group`, `occupation_gu`, `avatar`, `bio_gu`, `emergency_contact`, `created_at`, `updated_at`) VALUES ('21', '21', 'Kishan Live Test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-24 14:52:42', '2026-08-24 14:52:42');

-- --------------------------------------------------------
-- Table structure & data for table `families`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `families`;
CREATE TABLE "families" ("id" integer primary key autoincrement not null, "family_name_gu" varchar not null, "family_name_en" varchar, "family_code" varchar not null, "head_user_id" integer, "description_gu" text, "created_at" datetime, "updated_at" datetime, foreign key("head_user_id") references "users"("id") on delete set null);

INSERT INTO `families` (`id`, `family_name_gu`, `family_name_en`, `family_code`, `head_user_id`, `description_gu`, `created_at`, `updated_at`) VALUES ('2', 'Kishan Sejani Test પરિવાર', 'Kishan Sejani Test Family', 'FAM18368', '19', 'અંગત અને પારિવારિક ખાતું', '2026-08-26 07:26:55', '2026-08-26 07:26:55');
INSERT INTO `families` (`id`, `family_name_gu`, `family_name_en`, `family_code`, `head_user_id`, `description_gu`, `created_at`, `updated_at`) VALUES ('3', 'New User Test પરિવાર', 'New User Test Family', 'FAM46688', '20', 'અંગત અને પારિવારિક ખાતું', '2026-08-26 07:26:55', '2026-08-26 07:26:55');
INSERT INTO `families` (`id`, `family_name_gu`, `family_name_en`, `family_code`, `head_user_id`, `description_gu`, `created_at`, `updated_at`) VALUES ('4', 'Kishan Live Test પરિવાર', 'Kishan Live Test Family', 'FAM60958', '21', 'અંગત અને પારિવારિક ખાતું', '2026-08-26 07:26:55', '2026-08-26 07:26:55');

-- --------------------------------------------------------
-- Table structure & data for table `family_members`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `family_members`;
CREATE TABLE "family_members" ("id" integer primary key autoincrement not null, "family_id" integer not null, "user_id" integer not null, "relation_title_gu" varchar not null, "is_admin" tinyint(1) not null default '0', "created_at" datetime, "updated_at" datetime, foreign key("family_id") references "families"("id") on delete cascade, foreign key("user_id") references "users"("id") on delete cascade);

INSERT INTO `family_members` (`id`, `family_id`, `user_id`, `relation_title_gu`, `is_admin`, `created_at`, `updated_at`) VALUES ('22', '2', '19', 'મોભી', '1', '2026-08-26 07:26:55', '2026-08-26 07:26:55');
INSERT INTO `family_members` (`id`, `family_id`, `user_id`, `relation_title_gu`, `is_admin`, `created_at`, `updated_at`) VALUES ('23', '3', '20', 'મોભી', '1', '2026-08-26 07:26:55', '2026-08-26 07:26:55');
INSERT INTO `family_members` (`id`, `family_id`, `user_id`, `relation_title_gu`, `is_admin`, `created_at`, `updated_at`) VALUES ('24', '4', '21', 'મોભી', '1', '2026-08-26 07:26:55', '2026-08-26 07:26:55');

-- --------------------------------------------------------
-- Table structure & data for table `personal_records`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `personal_records`;
CREATE TABLE "personal_records" ("id" integer primary key autoincrement not null, "user_id" integer not null, "record_type" varchar not null default 'note', "title" varchar not null, "content" text, "amount" numeric, "category" varchar, "record_date" date not null, "is_pinned" tinyint(1) not null default '0', "is_locked" tinyint(1) not null default '0', "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade);

-- --------------------------------------------------------
-- Table structure & data for table `fcm_tokens`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `fcm_tokens`;
CREATE TABLE "fcm_tokens" ("id" integer primary key autoincrement not null, "user_id" integer not null, "token" varchar not null, "device_type" varchar not null default 'android', "device_name" varchar, "last_active_at" datetime, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade);

-- --------------------------------------------------------
-- Table structure & data for table `audit_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE "audit_logs" ("id" integer primary key autoincrement not null, "user_id" integer, "action" varchar not null, "details" text, "ip_address" varchar, "user_agent" text, "created_at" datetime not null default CURRENT_TIMESTAMP, foreign key("user_id") references "users"("id") on delete set null);

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('1', '5', 'login_success', 'સફળ લૉગિન: react-native-mobile', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-24 10:09:53');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('2', '5', 'login_success', 'સફળ લૉગિન: react-native-mobile', '192.168.1.22', 'Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0', '2026-08-24 11:30:22');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('3', '5', 'login_success', 'સફળ લૉગિન: react-native-mobile', '127.0.0.1', 'okhttp/4.12.0', '2026-08-24 13:20:53');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('4', NULL, 'unauthorized_login_attempt', 'ખોટો પાસવર્ડ અથવા મોબાઈલ: 9879654628', '127.0.0.1', 'okhttp/4.12.0', '2026-08-24 14:45:53');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('5', '5', 'login_success', 'સફળ લૉગિન: mobile-app', '127.0.0.1', NULL, '2026-08-24 14:49:14');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('6', '5', 'login_success', 'સફળ લૉગિન: mobile-app', '127.0.0.1', NULL, '2026-08-24 14:52:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('7', '5', 'login_success', 'સફળ લૉગિન: mobile-app', '127.0.0.1', NULL, '2026-08-24 14:52:23');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('8', '5', 'login_success', 'સફળ લૉગિન: mobile-app', '127.0.0.1', NULL, '2026-08-24 14:52:41');

-- --------------------------------------------------------
-- Table structure & data for table `personal_access_tokens`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE "personal_access_tokens" ("id" integer primary key autoincrement not null, "tokenable_type" varchar not null, "tokenable_id" integer not null, "name" text not null, "token" varchar not null, "abilities" text, "last_used_at" datetime, "expires_at" datetime, "created_at" datetime, "updated_at" datetime);

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('1', 'App\Models\User', '5', 'react-native-mobile', 'bf4eca049af5221d59c459f1d8c6485c4a1282863607eb5f4a96e461ddcb2665', '["*"]', '2026-08-24 11:09:42', NULL, '2026-08-24 10:09:53', '2026-08-24 11:09:42');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('2', 'App\Models\User', '5', 'test', 'd3148df68627e8cd0adb37e640ec17d1497616d6aeee85ea4a95db87344aa8be', '["*"]', '2026-08-24 10:57:50', NULL, '2026-08-24 10:57:50', '2026-08-24 10:57:50');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('3', 'App\Models\User', '5', 'test2', 'd155de489fc45821b5045bef0d04123aa1cd3ee426e5bde5b6b4416c45ca231e', '["*"]', '2026-08-24 10:58:04', NULL, '2026-08-24 10:58:04', '2026-08-24 10:58:04');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('4', 'App\Models\User', '5', 'test3', '1f25366249d0a8c01973dba6279bace6bdb7c54e0f815c5f28331f9ac94c103c', '["*"]', '2026-08-24 10:58:15', NULL, '2026-08-24 10:58:15', '2026-08-24 10:58:15');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('5', 'App\Models\User', '5', 'test3', 'e7063e1eaff356e25f6c3b6787d568015c858a4ef59f1a2f528619fddfe8eb9d', '["*"]', '2026-08-24 10:58:29', NULL, '2026-08-24 10:58:29', '2026-08-24 10:58:29');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('6', 'App\Models\User', '5', 'test2', 'f2038d35e923835ad1436fe9ad0a7b7fdec182eb5bab270b27a5102a22e5f836', '["*"]', '2026-08-24 10:58:33', NULL, '2026-08-24 10:58:33', '2026-08-24 10:58:33');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('7', 'App\Models\User', '5', 'react-native-mobile', 'ed2f9cb2a35a01e2f991dd0422c429b84e6dfaeb849aa35c4da2e9fdb7ed8b1c', '["*"]', '2026-08-24 11:32:31', NULL, '2026-08-24 11:30:22', '2026-08-24 11:32:31');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('8', 'App\Models\User', '5', 'react-native-mobile', '96861cc501ec2fd74108b44c396713284eac6214950f6a36600be2fda65c3a0d', '["*"]', '2026-08-24 13:52:29', NULL, '2026-08-24 13:20:53', '2026-08-24 13:52:29');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('9', 'App\Models\User', '19', 'mobile-app', 'b3b326e7d8c750ee879a0b445688ea86bd68423b008258cfef7e761a2cd28989', '["*"]', NULL, NULL, '2026-08-24 14:35:24', '2026-08-24 14:35:24');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('10', 'App\Models\User', '5', 'mobile-app', '86807ba8edf7f359f9b2c9b37604e259d98c05927d2bf027dbd0f48546cb7891', '["*"]', NULL, NULL, '2026-08-24 14:49:14', '2026-08-24 14:49:14');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('11', 'App\Models\User', '5', 'mobile-app', '97ce1b163747740b95e23ca6289491d66343f9fcaedb4abb7ae29f55fbdcac45', '["*"]', '2026-08-24 14:52:12', NULL, '2026-08-24 14:52:12', '2026-08-24 14:52:12');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('12', 'App\Models\User', '5', 'mobile-app', '9e91483d7f01492d614a1a52eaaa2e433fec163e885a21b4961cdd1ff055ced9', '["*"]', '2026-08-24 14:52:24', NULL, '2026-08-24 14:52:23', '2026-08-24 14:52:24');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('13', 'App\Models\User', '20', 'mobile-app', 'f907d5ab34e28446c1e276b61c03b2201feaa2d73c06b8c94ee814fc37cbf16e', '["*"]', NULL, NULL, '2026-08-24 14:52:24', '2026-08-24 14:52:24');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('14', 'App\Models\User', '5', 'mobile-app', 'a126e394e3b3414fe48ca2cb4b5c325bab4c27f5da252959105b47ff9b56557e', '["*"]', '2026-08-24 14:52:42', NULL, '2026-08-24 14:52:41', '2026-08-24 14:52:42');
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES ('15', 'App\Models\User', '21', 'mobile-app', 'ad6ff34d27e28480b9c3fbed27efe65f68f2ab1afe0c723ba0726d0202f43702', '["*"]', NULL, NULL, '2026-08-24 14:52:42', '2026-08-24 14:52:42');

-- --------------------------------------------------------
-- Table structure & data for table `farms`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `farms`;
CREATE TABLE "farms" ("id" integer primary key autoincrement not null, "user_id" integer not null, "name_gu" varchar not null, "village" varchar, "survey_number" varchar, "area_vigha" numeric not null default '0', "notes" text, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade);

INSERT INTO `farms` (`id`, `user_id`, `name_gu`, `village`, `survey_number`, `area_vigha`, `notes`, `created_at`, `updated_at`) VALUES ('1', '5', 'વાડી વાળું મોટું ખેતર', 'કલોલ', '૪૫/૨', '12.5', 'બોર અને ટપક પદ્ધતિ સાથે.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farms` (`id`, `user_id`, `name_gu`, `village`, `survey_number`, `area_vigha`, `notes`, `created_at`, `updated_at`) VALUES ('2', '5', 'કુવા વાળું ખેતર', 'કલોલ', '૭૮/૧', '8', 'કેનાલ પાણી સુવિધા.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farms` (`id`, `user_id`, `name_gu`, `village`, `survey_number`, `area_vigha`, `notes`, `created_at`, `updated_at`) VALUES ('3', '5', 'વાડી વાળું મોટું ખેતર', 'કલોલ', '૪૫/૨', '12.5', 'બોર અને ટપક પદ્ધતિ સાથે.', '2026-08-24 10:39:38', '2026-08-24 10:39:38');

-- --------------------------------------------------------
-- Table structure & data for table `farm_crops`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `farm_crops`;
CREATE TABLE "farm_crops" ("id" integer primary key autoincrement not null, "user_id" integer not null, "farm_id" integer, "crop_name_gu" varchar not null, "season" varchar not null default 'ચોમાસુ', "sowing_date" date, "harvest_date" date, "status" varchar not null default 'active', "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade, foreign key("farm_id") references "farms"("id") on delete set null);

INSERT INTO `farm_crops` (`id`, `user_id`, `farm_id`, `crop_name_gu`, `season`, `sowing_date`, `harvest_date`, `status`, `created_at`, `updated_at`) VALUES ('1', '5', '1', 'મગફળી (જી-૨૦)', 'ચોમાસુ', '2026-06-15', NULL, 'harvested', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_crops` (`id`, `user_id`, `farm_id`, `crop_name_gu`, `season`, `sowing_date`, `harvest_date`, `status`, `created_at`, `updated_at`) VALUES ('2', '5', '2', 'કપાસ (બીટી)', 'ચોમાસુ', '2026-06-20', NULL, 'active', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_crops` (`id`, `user_id`, `farm_id`, `crop_name_gu`, `season`, `sowing_date`, `harvest_date`, `status`, `created_at`, `updated_at`) VALUES ('3', '5', '3', 'મગફળી (જી-૨૦)', 'ચોમાસુ', '2026-06-15', NULL, 'harvested', '2026-08-24 10:39:38', '2026-08-24 10:39:38');

-- --------------------------------------------------------
-- Table structure & data for table `farm_productions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `farm_productions`;
CREATE TABLE "farm_productions" ("id" integer primary key autoincrement not null, "user_id" integer not null, "crop_id" integer, "crop_name_gu" varchar not null, "quantity" numeric not null, "unit" varchar not null, "rate_per_unit" numeric not null, "total_amount" numeric not null, "equivalent_man" numeric, "equivalent_kg" numeric, "buyer_name" varchar, "sale_date" date not null, "notes" text, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade, foreign key("crop_id") references "farm_crops"("id") on delete set null);

INSERT INTO `farm_productions` (`id`, `user_id`, `crop_id`, `crop_name_gu`, `quantity`, `unit`, `rate_per_unit`, `total_amount`, `equivalent_man`, `equivalent_kg`, `buyer_name`, `sale_date`, `notes`, `created_at`, `updated_at`) VALUES ('1', '5', '1', 'મગફળી', '20', 'khandi', '28000', '560000', '400', '8000', 'રાજકોટ માર્કેટ યાર્ડ - ગોકુલ ટ્રેડર્સ', '2026-08-10', 'નંબર ૧ ગુણવત્તા મગફળી પેમેન્ટ રોકડેથી ચૂકતે.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_productions` (`id`, `user_id`, `crop_id`, `crop_name_gu`, `quantity`, `unit`, `rate_per_unit`, `total_amount`, `equivalent_man`, `equivalent_kg`, `buyer_name`, `sale_date`, `notes`, `created_at`, `updated_at`) VALUES ('2', '5', '2', 'કપાસ', '50', 'man', '1550', '77500', '50', '1000', 'શ્રી રામ જીનિંગ મિલ', '2026-08-18', 'પ્રથમ વીણી કપાસ.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_productions` (`id`, `user_id`, `crop_id`, `crop_name_gu`, `quantity`, `unit`, `rate_per_unit`, `total_amount`, `equivalent_man`, `equivalent_kg`, `buyer_name`, `sale_date`, `notes`, `created_at`, `updated_at`) VALUES ('3', '5', '3', 'મગફળી', '20', 'khandi', '28000', '560000', '400', '8000', 'ગોંડલ માર્કેટ યાર્ડ', '2026-08-10', 'પેમેન્ટ ચૂકતે.', '2026-08-24 10:39:38', '2026-08-24 10:39:38');

-- --------------------------------------------------------
-- Table structure & data for table `farm_expenses`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `farm_expenses`;
CREATE TABLE "farm_expenses" ("id" integer primary key autoincrement not null, "user_id" integer not null, "crop_id" integer, "expense_type" varchar not null, "title_gu" varchar not null, "amount" numeric not null, "quantity_or_hours" numeric, "unit_rate" numeric, "expense_date" date not null, "notes" text, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade, foreign key("crop_id") references "farm_crops"("id") on delete set null);

INSERT INTO `farm_expenses` (`id`, `user_id`, `crop_id`, `expense_type`, `title_gu`, `amount`, `quantity_or_hours`, `unit_rate`, `expense_date`, `notes`, `created_at`, `updated_at`) VALUES ('1', '5', '1', 'labour', 'મગફળી ઉપાડવાની મજૂરી', '6750', '15', '450', '2026-08-05', '૧૫ મજૂર × ₹૪૫૦ રોજ.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_expenses` (`id`, `user_id`, `crop_id`, `expense_type`, `title_gu`, `amount`, `quantity_or_hours`, `unit_rate`, `expense_date`, `notes`, `created_at`, `updated_at`) VALUES ('2', '5', '1', 'tractor', 'ટ્રેક્ટર થ્રેસર મગફળી કાઢવાનો ચાર્જ', '7200', '8', '900', '2026-08-08', '૮ કલાક થ્રેસર.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_expenses` (`id`, `user_id`, `crop_id`, `expense_type`, `title_gu`, `amount`, `quantity_or_hours`, `unit_rate`, `expense_date`, `notes`, `created_at`, `updated_at`) VALUES ('3', '5', '1', 'fertilizer', 'DAP ખાતર - ૬ થેલી', '8100', '6', '1350', '2026-06-25', 'ઇફ્કો ખાતર.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_expenses` (`id`, `user_id`, `crop_id`, `expense_type`, `title_gu`, `amount`, `quantity_or_hours`, `unit_rate`, `expense_date`, `notes`, `created_at`, `updated_at`) VALUES ('4', '5', '2', 'medicine', 'ઇયળ નિયંત્રણ દવા છંટકાવ', '3600', '3', '1200', '2026-07-15', 'કપાસમાં પ્રથમ સ્પ્રે.', '2026-08-24 10:24:04', '2026-08-24 10:24:04');
INSERT INTO `farm_expenses` (`id`, `user_id`, `crop_id`, `expense_type`, `title_gu`, `amount`, `quantity_or_hours`, `unit_rate`, `expense_date`, `notes`, `created_at`, `updated_at`) VALUES ('5', '5', NULL, 'fertilizer', 'DAP ખાતર - ૬ થેલી', '8100', '6', '1350', '2026-08-24', NULL, '2026-08-24 11:32:31', '2026-08-24 11:32:31');
INSERT INTO `farm_expenses` (`id`, `user_id`, `crop_id`, `expense_type`, `title_gu`, `amount`, `quantity_or_hours`, `unit_rate`, `expense_date`, `notes`, `created_at`, `updated_at`) VALUES ('6', '5', NULL, 'medicine', 'ઇયળ દવા છંટકાવ', '3600', NULL, '12000', '2026-08-24', NULL, '2026-08-24 11:32:31', '2026-08-24 11:32:31');

-- --------------------------------------------------------
-- Table structure & data for table `tractor_works`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tractor_works`;
CREATE TABLE "tractor_works" ("id" integer primary key autoincrement not null, "user_id" integer not null, "work_category" varchar not null default 'customer', "customer_name" varchar, "customer_phone" varchar, "operation_type" varchar not null, "trips_count" integer not null default '1', "calc_basis" varchar not null default 'vigha', "units_count" numeric not null, "rate_per_unit" numeric not null, "total_amount" numeric not null, "payment_status" varchar not null default 'pending', "paid_amount" numeric not null default '0', "work_date" date not null, "notes" text, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade);

-- --------------------------------------------------------
-- Table structure & data for table `tasks`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE "tasks" ("id" integer primary key autoincrement not null, "user_id" integer not null, "title" varchar not null, "category" varchar not null default 'payment_collect', "amount" numeric, "task_date" date not null, "task_time" varchar, "reminder_datetime" datetime, "is_completed" tinyint(1) not null default '0', "notes" text, "created_at" datetime, "updated_at" datetime, foreign key("user_id") references "users"("id") on delete cascade);

INSERT INTO `tasks` (`id`, `user_id`, `title`, `category`, `amount`, `task_date`, `task_time`, `reminder_datetime`, `is_completed`, `notes`, `created_at`, `updated_at`) VALUES ('1', '5', 'રામભાઈ પટેલ પાસેથી ટ્રેક્ટર ભાડું ₹૧૦,૦૦૦ લેવાનું છે', 'payment_collect', '10000', '2026-08-25', '10:00 AM', NULL, '0', 'દાંતી અને રાંપનું બાકી પેમેન્ટ.', '2026-08-24 11:05:49', '2026-08-24 11:05:49');
INSERT INTO `tasks` (`id`, `user_id`, `title`, `category`, `amount`, `task_date`, `task_time`, `reminder_datetime`, `is_completed`, `notes`, `created_at`, `updated_at`) VALUES ('2', '5', 'વાડીની લાઈટનું બિલ ભરવાનું છે', 'bill_pay', '3200', '2026-08-26', '11:30 AM', NULL, '0', 'પીજીવીસીએલ ઓનલાઇન બિલ.', '2026-08-24 11:05:49', '2026-08-24 11:05:49');
INSERT INTO `tasks` (`id`, `user_id`, `title`, `category`, `amount`, `task_date`, `task_time`, `reminder_datetime`, `is_completed`, `notes`, `created_at`, `updated_at`) VALUES ('3', '5', 'કપાસમાં ઇયળ નિયંત્રણ દવા છાંટવાનું કામ', 'farming_work', NULL, '2026-08-27', '07:00 AM', NULL, '0', 'સવારે વહેલા પવન ન હોય ત્યારે સ્પ્રે કરવો.', '2026-08-24 11:05:49', '2026-08-24 11:05:49');
INSERT INTO `tasks` (`id`, `user_id`, `title`, `category`, `amount`, `task_date`, `task_time`, `reminder_datetime`, `is_completed`, `notes`, `created_at`, `updated_at`) VALUES ('4', '5', 'Test Task Alert', 'payment_collect', NULL, '2026-08-25', '10:00 AM', NULL, '0', NULL, '2026-08-24 14:52:42', '2026-08-24 14:52:42');

