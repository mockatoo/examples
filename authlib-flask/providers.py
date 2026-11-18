import os

from authlib.integrations.flask_client import FlaskOAuth2App

MOCK_ORIGIN = "https://app.mockatoo.globalunderdog.com"
DISCOVERY = "/.well-known/openid-configuration"
MOCK_MICROSOFT_TENANT = "00000000-0000-4000-8000-000000000001"


class LinkedInOAuth(FlaskOAuth2App):
    def parse_id_token(self, token, nonce, **kwargs):
        # LinkedIn does not return the nonce. Authlib still validates the signed
        # ID token and ties the authorization code to this browser using state.
        return super().parse_id_token(token, nonce=None, **kwargs)


def register_providers(oauth):
    # The hosted demo opts in through its .env. Delete that setting before shipping.
    use_mock = os.getenv("MOCKATOO_FORCE") == "true"
    origin = (os.getenv("MOCKATOO_URL") or MOCK_ORIGIN).rstrip("/")
    tenant = MOCK_MICROSOFT_TENANT if use_mock else os.getenv("MICROSOFT_TENANT_ID")
    microsoft = origin if use_mock else "https://login.microsoftonline.com"
    if use_mock:
        microsoft += "/login.microsoftonline.com"

    github = f"{origin}/github" if use_mock else "https://github.com"
    github_api = f"{github}/api/v3" if use_mock else "https://api.github.com"
    discord = f"{origin}/discord" if use_mock else "https://discord.com"
    facebook = f"{origin}/facebook" if use_mock else "https://www.facebook.com"
    facebook_graph = f"{facebook}/graph" if use_mock else "https://graph.facebook.com"
    x = f"{origin}/x" if use_mock else "https://x.com"
    x_api = x if use_mock else "https://api.x.com"

    configs = {
        "apple": (
            "Apple",
            "openid name email",
            {
                "server_metadata_url": (
                    f"{origin}/apple" if use_mock else "https://appleid.apple.com"
                )
                + DISCOVERY,
                "authorize_params": {"response_mode": "form_post"},
                "client_kwargs": {"token_endpoint_auth_method": "client_secret_post"},
            },
        ),
        "google": (
            "Google",
            "openid email profile",
            {
                "server_metadata_url": (
                    f"{origin}/google" if use_mock else "https://accounts.google.com"
                )
                + DISCOVERY
            },
        ),
        "github": (
            "GitHub",
            "read:user user:email",
            {
                "authorize_url": f"{github}/login/oauth/authorize",
                "access_token_url": f"{github}/login/oauth/access_token",
                "api_base_url": f"{github_api}/",
                "client_kwargs": {"token_endpoint_auth_method": "client_secret_post"},
            },
        ),
        "discord": (
            "Discord",
            "identify email",
            {
                "authorize_url": f"{discord}/api/oauth2/authorize",
                "access_token_url": f"{discord}/api/oauth2/token",
                "api_base_url": f"{discord}/api/",
                "client_kwargs": {"token_endpoint_auth_method": "client_secret_post"},
            },
        ),
        "facebook": (
            "Facebook",
            "public_profile email",
            {
                "authorize_url": f"{facebook}/v24.0/dialog/oauth",
                "access_token_url": f"{facebook_graph}/v24.0/oauth/access_token",
                "api_base_url": f"{facebook_graph}/v24.0/",
                "client_kwargs": {"token_endpoint_auth_method": "client_secret_post"},
            },
        ),
        "linkedin": (
            "LinkedIn",
            "openid profile email",
            {
                "server_metadata_url": (
                    f"{origin}/linkedin/oauth"
                    if use_mock
                    else "https://www.linkedin.com/oauth"
                )
                + DISCOVERY,
                "client_cls": LinkedInOAuth,
                "client_kwargs": {"token_endpoint_auth_method": "client_secret_post"},
            },
        ),
        "microsoft": (
            "Microsoft",
            "openid profile email",
            {
                "server_metadata_url": f"{microsoft}/{tenant}/v2.0{DISCOVERY}"
                if tenant
                else ""
            },
        ),
        "x": (
            "X",
            "users.read tweet.read users.email",
            {
                "authorize_url": f"{x}/i/oauth2/authorize",
                "access_token_url": f"{x_api}/2/oauth2/token",
                "api_base_url": f"{x_api}/2/",
                "client_kwargs": {"code_challenge_method": "S256"},
            },
        ),
    }

    providers = {}
    for provider, (label, scope, config) in configs.items():
        prefix = provider.upper()
        client_id = "mockatoo" if use_mock else os.getenv(f"{prefix}_CLIENT_ID")
        client_secret = (
            "mockatoo-secret" if use_mock else os.getenv(f"{prefix}_CLIENT_SECRET")
        )
        if not client_id and not client_secret:
            continue
        if not client_id or not client_secret:
            raise RuntimeError(
                f"Set both {prefix}_CLIENT_ID and {prefix}_CLIENT_SECRET."
            )
        if not use_mock:
            for key in (
                "server_metadata_url",
                "authorize_url",
                "access_token_url",
                "api_base_url",
            ):
                if key in config:
                    config[key] = os.getenv(f"{prefix}_{key.upper()}") or config[key]
        if provider == "microsoft" and not config["server_metadata_url"]:
            raise RuntimeError(
                "Set MICROSOFT_TENANT_ID or MICROSOFT_SERVER_METADATA_URL."
            )
        client_kwargs = config.pop("client_kwargs", {})
        oauth.register(
            name=provider,
            client_id=client_id,
            client_secret=client_secret,
            client_kwargs={"scope": scope, **client_kwargs},
            **config,
        )
        providers[provider] = label
    if not providers:
        raise RuntimeError("Configure provider credentials or set MOCKATOO_FORCE=true.")
    return providers


def get_json(client, token, path, **kwargs):
    response = client.get(path, token=token, **kwargs)
    response.raise_for_status()
    return response.json()


def get_identity(provider, client, token):
    if provider in {"apple", "google", "linkedin", "microsoft"}:
        user = token.get("userinfo", {})
        return user.get("sub"), user.get("email")

    if provider == "github":
        user = get_json(client, token, "user")
        email = user.get("email")
        if not email:
            emails = get_json(client, token, "user/emails")
            email = next(
                (
                    item["email"]
                    for item in emails
                    if item["primary"] and item["verified"]
                ),
                None,
            )
        return user.get("id"), email

    if provider == "discord":
        user = get_json(client, token, "users/@me")
        return user.get("id"), user.get("email")

    if provider == "facebook":
        user = get_json(client, token, "me", params={"fields": "id,email"})
        return user.get("id"), user.get("email")

    user = get_json(
        client, token, "users/me", params={"user.fields": "confirmed_email"}
    ).get("data", {})
    return user.get("id"), user.get("confirmed_email")
