<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mockatoo Laravel Socialite Example</title>
  <link rel="stylesheet" href="/style.css">
  <script defer src="/forms.js"></script>
</head>
<body>
  <main>
    <section class="card">
      <a class="brand" href="https://github.com/mockatoo/examples/tree/main/socialite-laravel">
        <span class="brand-logo" aria-hidden="true"></span>
        Mockatoo Laravel Socialite Example
      </a>
      @if ($profile)
        <p class="signed-in">You are logged in</p>
        <h1 class="session-title">Your session</h1>
        <pre class="session-json"><code>{{ json_encode($profile, JSON_PRETTY_PRINT) }}</code></pre>
        <a class="cta" href="https://app.mockatoo.globalunderdog.com" target="_blank" rel="noopener noreferrer">Explore Mockatoo</a>
        <form method="post" action="/sign-out">
          @csrf
          <button type="submit" class="secondary">Sign out</button>
        </form>
      @else
        <h1>Welcome back</h1>
        @if ($failed)
          <p role="alert" class="error">Sign-in failed. Authorization was declined or could not be verified. Please try again.</p>
        @endif
        @if ($providers)
          <p>Please sign in with one of the providers below. We will request access to your basic profile and email where available.</p>
          <div class="providers">
            @foreach ($providers as $provider => $label)
              <form class="provider" method="post" action="/sign-in/{{ $provider }}">
                @csrf
                <button type="submit">
                  @include('provider-logo')
                  Sign in with {{ $label }}
                </button>
              </form>
            @endforeach
          </div>
        @else
          <p>Configure a provider in <code>.env.local</code> to sign in.</p>
        @endif
      @endif
    </section>
  </main>
</body>
</html>
