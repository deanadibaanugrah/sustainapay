<?php

// Fix Vercel serverless read-only filesystem issues
$_ENV['LOG_CHANNEL'] = 'stderr';
$_ENV['VIEW_COMPILED_PATH'] = '/tmp';
$_ENV['SESSION_DRIVER'] = 'cookie';
$_ENV['CACHE_STORE'] = 'array';

// Forward Vercel requests to normal index.php
require __DIR__ . '/../public/index.php';
