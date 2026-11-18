from allauth.account.models import EmailAddress
from allauth.socialaccount.internal import jwtkit
from allauth.socialaccount.providers.apple.client import AppleOAuth2Client
from allauth.socialaccount.providers.apple.provider import AppleProvider
from allauth.socialaccount.providers.apple.views import AppleOAuth2Adapter
from allauth.socialaccount.providers.discord.provider import DiscordProvider
from allauth.socialaccount.providers.discord.views import DiscordOAuth2Adapter
from allauth.socialaccount.providers.facebook.provider import FacebookProvider
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.github.provider import GitHubProvider
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.google.provider import GoogleProvider
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter
from allauth.socialaccount.providers.openid_connect.provider import (
    OpenIDConnectProvider,
)
from allauth.socialaccount.providers.twitter_oauth2.provider import (
    TwitterOAuth2Provider,
)
from allauth.socialaccount.providers.twitter_oauth2.views import TwitterOAuth2Adapter
from django.conf import settings

from .providers import MOCK_MICROSOFT_TENANT


class MockAppleClient(AppleOAuth2Client):
    def generate_client_secret(self):
        return self.consumer_secret


class MockAppleAdapter(AppleOAuth2Adapter):
    issuer = f"{settings.MOCK_ORIGIN}/apple"
    authorize_url = f"{issuer}/auth/authorize"
    access_token_url = f"{issuer}/auth/token"
    public_key_url = f"{issuer}/auth/keys"
    client_class = MockAppleClient

    def parse_token(self, data):
        token = OAuth2Adapter.parse_token(self, data)
        token._verified_identity_data = jwtkit.verify_and_decode(
            credential=data["id_token"],
            keys_url=self.public_key_url,
            issuer=self.issuer,
            audience=self.get_provider().get_auds(),
            lookup_kid=jwtkit.lookup_kid_jwk,
        )
        return token


class MockAppleProvider(AppleProvider):
    package = AppleProvider.get_package()
    oauth2_adapter_class = MockAppleAdapter


class MockGoogleAdapter(GoogleOAuth2Adapter):
    base_url = f"{settings.MOCK_ORIGIN}/google"
    authorize_url = f"{base_url}/o/oauth2/v2/auth"
    access_token_url = f"{base_url}/token"
    identity_url = f"{base_url}/v1/userinfo"


class MockGoogleProvider(GoogleProvider):
    package = GoogleProvider.get_package()
    oauth2_adapter_class = MockGoogleAdapter


class MockGitHubAdapter(GitHubOAuth2Adapter):
    base_url = f"{settings.MOCK_ORIGIN}/github"
    authorize_url = f"{base_url}/login/oauth/authorize"
    access_token_url = f"{base_url}/login/oauth/access_token"
    profile_url = f"{base_url}/api/v3/user"
    emails_url = f"{base_url}/api/v3/user/emails"


class MockGitHubProvider(GitHubProvider):
    package = GitHubProvider.get_package()
    oauth2_adapter_class = MockGitHubAdapter


class MockDiscordAdapter(DiscordOAuth2Adapter):
    base_url = f"{settings.MOCK_ORIGIN}/discord/api"
    authorize_url = f"{base_url}/oauth2/authorize"
    access_token_url = f"{base_url}/oauth2/token"
    profile_url = f"{base_url}/users/@me"


class MockDiscordProvider(DiscordProvider):
    package = DiscordProvider.get_package()
    oauth2_adapter_class = MockDiscordAdapter


class MockFacebookAdapter(FacebookOAuth2Adapter):
    authorize_url = f"{settings.MOCK_ORIGIN}/facebook/v24.0/dialog/oauth"


class MockFacebookProvider(FacebookProvider):
    package = FacebookProvider.get_package()
    oauth2_adapter_class = MockFacebookAdapter


class MockOpenIDConnectProvider(OpenIDConnectProvider):
    package = OpenIDConnectProvider.get_package()

    @property
    def server_url(self):
        paths = {
            "linkedin": "/linkedin/oauth",
            "microsoft": f"/login.microsoftonline.com/{MOCK_MICROSOFT_TENANT}/v2.0",
        }
        return self.wk_server_url(
            f"{settings.MOCK_ORIGIN}{paths[self.app.provider_id]}"
        )


class MockXAdapter(TwitterOAuth2Adapter):
    base_url = f"{settings.MOCK_ORIGIN}/x"
    authorize_url = f"{base_url}/i/oauth2/authorize"
    access_token_url = f"{base_url}/2/oauth2/token"
    profile_url = f"{base_url}/2/users/me"


class MockXProvider(TwitterOAuth2Provider):
    package = TwitterOAuth2Provider.get_package()
    oauth2_adapter_class = MockXAdapter

    def extract_email_addresses(self, data):
        if email := data.get("confirmed_email"):
            return [EmailAddress(email=email, verified=True, primary=True)]
        return []
