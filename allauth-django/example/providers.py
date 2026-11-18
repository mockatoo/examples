import os

from django.core.exceptions import ImproperlyConfigured

# IDs used by the sign-in buttons, in display order.
LABELS = {
    "apple": "Apple",
    "google": "Google",
    "github": "GitHub",
    "discord": "Discord",
    "facebook": "Facebook",
    "linkedin": "LinkedIn",
    "microsoft": "Microsoft",
    "x": "X",
}


MOCK_MICROSOFT_TENANT = "00000000-0000-4000-8000-000000000001"


def configure_providers(use_mock, origin):
    options = {
        "google": {"SCOPE": ["profile", "email"], "OAUTH_PKCE_ENABLED": True},
        "facebook": {
            "VERSION": "v24.0",
            "SCOPE": ["public_profile", "email"],
            "FIELDS": ["id", "name", "email"],
        },
    }

    if use_mock:
        options["x"] = {
            "SCOPE": ["users.read", "tweet.read", "users.email"],
            "FIELDS": ["id", "name", "username", "confirmed_email"],
        }
        mock_classes = {
            "apple": "MockAppleProvider",
            "google": "MockGoogleProvider",
            "github": "MockGitHubProvider",
            "discord": "MockDiscordProvider",
            "facebook": "MockFacebookProvider",
            "openid_connect": "MockOpenIDConnectProvider",
            "x": "MockXProvider",
        }
        for provider, class_name in mock_classes.items():
            options.setdefault(provider, {})["provider_class"] = (
                f"example.provider_adapters.{class_name}"
            )
        # Allauth uses the Graph base for both its token view and profile request.
        options["facebook"]["GRAPH_API_URL"] = f"{origin}/facebook/graph/v24.0"

    enabled = {}
    config = {}
    for provider, label in LABELS.items():
        prefix = provider.upper()
        client_id = "mockatoo" if use_mock else os.getenv(f"{prefix}_CLIENT_ID")
        secret = "mockatoo-secret" if use_mock else os.getenv(f"{prefix}_CLIENT_SECRET")
        if not client_id and not secret:
            continue
        if not client_id or not secret:
            raise ImproperlyConfigured(
                f"Set both {prefix}_CLIENT_ID and {prefix}_CLIENT_SECRET."
            )

        app_settings = {}
        app = {"client_id": client_id, "secret": secret, "settings": app_settings}
        enabled[provider] = label
        if use_mock:
            # The same developer can test every provider with their Mockatoo email.
            app_settings["email_authentication"] = True
            if provider in {"facebook", "microsoft"}:
                app_settings["verified_email"] = True

        # Allauth's Microsoft adapter fetches Graph /v1.0/me, which Mockatoo
        # doesn't serve yet (TIA-132). OIDC gets the identity from the Entra ID token.
        if provider in {"linkedin", "microsoft"}:
            if not use_mock:
                if provider == "microsoft":
                    tenant = os.getenv("MICROSOFT_TENANT_ID")
                    if not tenant:
                        raise ImproperlyConfigured("Set MICROSOFT_TENANT_ID.")
                    server_url = f"https://login.microsoftonline.com/{tenant}/v2.0"
                else:
                    server_url = "https://www.linkedin.com/oauth"
                app_settings["server_url"] = server_url
            app.update(provider_id=provider, name=label)
            app_settings["fetch_userinfo"] = False
            config.setdefault(
                "openid_connect", {**options.get("openid_connect", {}), "APPS": []}
            )["APPS"].append(app)
        else:
            if provider == "apple" and not use_mock:
                team_id = os.getenv("APPLE_TEAM_ID")
                private_key = os.getenv("APPLE_PRIVATE_KEY")
                if not team_id or not private_key:
                    raise ImproperlyConfigured(
                        "Set APPLE_TEAM_ID and APPLE_PRIVATE_KEY."
                    )
                app["key"] = team_id
                app_settings["certificate_key"] = private_key.replace("\\n", "\n")
            provider_id = "twitter_oauth2" if provider == "x" else provider
            config[provider_id] = {**options.get(provider, {}), "APPS": [app]}

    if not enabled:
        raise ImproperlyConfigured(
            "Configure provider credentials or set MOCKATOO_FORCE=true."
        )
    return enabled, config
