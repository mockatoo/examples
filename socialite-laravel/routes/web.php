<?php

use App\Socialite\Providers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

Route::get('/', fn (Request $request) => view('home', [
    'providers' => Providers::available(),
    'profile' => $request->session()->get('profile'),
    'failed' => $request->query('error') === 'oauth',
]));

Route::post('/sign-in/{provider}', function (Request $request, string $provider) {
    abort_unless(isset(Providers::available()[$provider]), 404);
    $request->session()->put('oauth_provider', $provider);

    return Socialite::driver($provider)->redirect();
});

$callback = function (Request $request, string $provider = 'apple') {
    abort_unless(isset(Providers::available()[$provider]), 404);

    if ($request->session()->pull('oauth_provider') !== $provider
        || ! is_string($request->input('code'))
        || $request->input('error') !== null) {
        return redirect('/?error=oauth', 303);
    }

    try {
        $user = Socialite::driver($provider)->user();
    } catch (Exception) {
        return redirect('/?error=oauth', 303);
    }

    if (! $user->getId()) {
        return redirect('/?error=oauth', 303);
    }

    $request->session()->regenerate();
    $request->session()->put('profile', [
        'provider' => Providers::LABELS[$provider],
        'id' => (string) $user->getId(),
        'email' => $user->getEmail(),
    ]);

    return redirect('/', 303);
};
Route::get('/auth/{provider}/callback', $callback)->whereIn('provider', [
    'google', 'github', 'discord', 'facebook', 'linkedin', 'microsoft', 'x',
]);
Route::post('/auth/apple/callback', $callback);

Route::post('/sign-out', function (Request $request) {
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/', 303);
});
