<?php

$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);

$pdo->exec('DELETE FROM family_members WHERE user_id <= 18');
$pdo->exec('DELETE FROM user_profiles WHERE user_id <= 18');
$pdo->exec('DELETE FROM personal_records WHERE user_id <= 18');
$pdo->exec('DELETE FROM users WHERE id <= 18');
$pdo->exec('DELETE FROM families WHERE id = 1');

echo "Cleaned users <= 18 successfully.\n";

copy($dbPath, dirname(__DIR__) . '/database.sqlite');
copy($dbPath, dirname(__DIR__) . '/database.db');

include __DIR__ . '/export_db.php';
