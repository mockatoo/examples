<?php

namespace App\Socialite;

use Laravel\Socialite\Two\GoogleProvider;

final class MockatooGoogleProvider extends GoogleProvider
{
    use UsesMockatoo;
}
