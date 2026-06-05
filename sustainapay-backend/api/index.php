<?php

// Fix Vercel serverless read-only filesystem issues
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

echo "TEST_VERCEL_PHP_EXECUTION\n";

$_ENV['LOG_CHANNEL'] = 'stderr';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';
$_SERVER['SCRIPT_NAME'] = '/index.php';

// Forward Vercel requests to normal index.php
require __DIR__ . '/../public/index.php';
