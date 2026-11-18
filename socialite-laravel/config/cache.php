<?php

return [
    // The OpenID Connect driver caches discovery documents and signing keys.
    // This demo has no database, so it keeps them per request. Use your app's
    // usual cache store instead.
    'default' => env('CACHE_STORE', 'array'),
];
