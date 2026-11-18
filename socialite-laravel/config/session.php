<?php

return [
    'driver' => 'cookie',
    'cookie' => 'mockatoo_laravel_session',
    // Apple returns with a cross-site POST. Browsers require HTTPS or localhost.
    'secure' => true,
    'same_site' => 'none',
];
