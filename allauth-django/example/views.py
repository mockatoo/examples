import json

from allauth.account.signals import user_logged_in
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter, get_adapter
from django.conf import settings
from django.dispatch import receiver
from django.shortcuts import redirect, render


def home(request):
    adapter = get_adapter(request)
    providers = []
    for key, label in settings.PROVIDERS.items():
        provider_id = "twitter_oauth2" if key == "x" else key
        provider = adapter.get_provider(request, provider_id)
        providers.append((key, label, provider.get_login_url(request)))

    identity = request.session.get("example_identity")
    if request.user.is_authenticated and identity is None:
        identity = (
            {"email": request.user.email}
            if request.user.email
            else {"username": request.user.get_username()}
        )

    return render(
        request,
        "index.html",
        {
            "providers": providers,
            "identity": json.dumps(identity, indent=2),
            "mock_origin": settings.MOCK_ORIGIN,
        },
    )


@receiver(user_logged_in)
def remember_identity(request, user, sociallogin=None, **kwargs):
    if sociallogin:
        account = sociallogin.account
        provider = "x" if account.provider == "twitter_oauth2" else account.provider
        identity = {"provider": provider, "id": account.uid}
        email = next(
            (email.email for email in sociallogin.email_addresses if email.primary),
            user.email,
        )
        if email:
            identity["email"] = email
        elif username := account.extra_data.get("username"):
            identity["username"] = username
        request.session["example_identity"] = identity


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def on_authentication_error(
        self, request, provider, error=None, exception=None, extra_context=None
    ):
        raise ImmediateHttpResponse(redirect("/?error=sign-in"))
