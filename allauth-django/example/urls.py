from django.conf import settings
from django.urls import include, path

from .views import home

account_patterns = []
if settings.USE_MOCK:
    from allauth.socialaccount.providers.oauth2.views import OAuth2CallbackView

    from .provider_adapters import (
        MockAppleAdapter,
        MockDiscordAdapter,
        MockFacebookAdapter,
        MockGitHubAdapter,
        MockGoogleAdapter,
        MockXAdapter,
    )

    # Allauth's registered login views use the configured provider classes.
    # Bind its callback views to the same mock adapters.
    for route, adapter in (
        ("apple/login/callback/finish/", MockAppleAdapter),
        ("google/login/callback/", MockGoogleAdapter),
        ("github/login/callback/", MockGitHubAdapter),
        ("discord/login/callback/", MockDiscordAdapter),
        ("facebook/login/callback/", MockFacebookAdapter),
        ("twitter_oauth2/login/callback/", MockXAdapter),
    ):
        account_patterns.append(path(route, OAuth2CallbackView.adapter_view(adapter)))

urlpatterns = [
    path("", home, name="home"),
    path("accounts/", include(account_patterns)),
    path("accounts/", include("allauth.urls")),
]
