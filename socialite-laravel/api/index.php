<?php

use Illuminate\Http\Request;

if (PHP_SAPI === 'cli-server'
    && in_array(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), ['/style.css', '/forms.js', '/mockatoo-logo.png'], true)) {
    return false;
}

require dirname(__DIR__).'/vendor/autoload.php';

(require dirname(__DIR__).'/bootstrap/app.php')->handleRequest(Request::capture());
