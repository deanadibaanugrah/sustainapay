<?php

// Fix Vercel serverless read-only filesystem issues
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

$_ENV['LOG_CHANNEL'] = 'stderr';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';
$_ENV['APP_DEBUG'] = 'true';
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/../public/index.php';

if (isset($_ENV['DB_HOST'])) { $_ENV['DB_HOST'] = trim($_ENV['DB_HOST'], " \t\n\r\0\x0B\"'"); putenv('DB_HOST=' . $_ENV['DB_HOST']); }
if (isset($_ENV['DB_PORT'])) { $_ENV['DB_PORT'] = trim($_ENV['DB_PORT'], " \t\n\r\0\x0B\"'"); putenv('DB_PORT=' . $_ENV['DB_PORT']); }
if (isset($_ENV['DB_DATABASE'])) { $_ENV['DB_DATABASE'] = trim($_ENV['DB_DATABASE'], " \t\n\r\0\x0B\"'"); putenv('DB_DATABASE=' . $_ENV['DB_DATABASE']); }
if (isset($_ENV['DB_USERNAME'])) { $_ENV['DB_USERNAME'] = trim($_ENV['DB_USERNAME'], " \t\n\r\0\x0B\"'"); putenv('DB_USERNAME=' . $_ENV['DB_USERNAME']); }
if (isset($_ENV['DB_PASSWORD'])) { $_ENV['DB_PASSWORD'] = trim($_ENV['DB_PASSWORD'], " \t\n\r\0\x0B\"'"); putenv('DB_PASSWORD=' . $_ENV['DB_PASSWORD']); }

// Forward Vercel requests to normal index.php
require __DIR__ . '/../public/index.php';
