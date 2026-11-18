<?php

$services = [
    // This demo opts in through its committed .env, including on Vercel.
    // Delete MOCKATOO_FORCE from .env before shipping your own app.
    'mockatoo' => [
        'enabled' => env('MOCKATOO_FORCE') === true,
        'origin' => rtrim(env('MOCKATOO_URL') ?: 'https://app.mockatoo.globalunderdog.com', '/'),
    ],
];

foreach (['apple', 'google', 'github', 'discord', 'facebook', 'linkedin', 'microsoft', 'x'] as $provider) {
    $prefix = strtoupper($provider);
    $services[$provider] = [
        'client_id' => env($prefix.'_CLIENT_ID'),
        'client_secret' => env($prefix.'_CLIENT_SECRET'),
        'redirect' => env($prefix.'_REDIRECT_URI'),
    ];
}

$services['microsoft']['tenant'] = env('MICROSOFT_TENANT_ID', 'common');

return $services;
