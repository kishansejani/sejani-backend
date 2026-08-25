<?php

$dbPath = __DIR__ . '/database/database.sqlite';
$outputPath = dirname(__DIR__) . '/database_export.sql';

if (!file_exists($dbPath)) {
    echo "Database file not found at: {$dbPath}\n";
    exit(1);
}

$pdo = new PDO('sqlite:' . $dbPath);
$tables = $pdo->query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_ASSOC);

$sql = "-- Database SQL Dump for TablePlus & Database Tools\n";
$sql .= "-- Database: personal\n";
$sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";

foreach ($tables as $table) {
    $name = $table['name'];
    $sql .= "-- --------------------------------------------------------\n";
    $sql .= "-- Table structure & data for table `{$name}`\n";
    $sql .= "-- --------------------------------------------------------\n\n";
    $sql .= "DROP TABLE IF EXISTS `{$name}`;\n";
    $sql .= $table['sql'] . ";\n\n";

    $rows = $pdo->query("SELECT * FROM '{$name}'")->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($rows)) {
        foreach ($rows as $row) {
            $cols = array_map(function($c) { return "`" . $c . "`"; }, array_keys($row));
            $vals = array_map(function($v) {
                if (is_null($v)) return 'NULL';
                return "'" . str_replace("'", "''", $v) . "'";
            }, array_values($row));

            $sql .= "INSERT INTO `{$name}` (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ");\n";
        }
        $sql .= "\n";
    }
}

file_put_contents($outputPath, $sql);
echo "SQL Dump successfully created at:\n" . $outputPath . " (" . number_format(filesize($outputPath)) . " bytes)\n";
