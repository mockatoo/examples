import os
from datetime import timedelta
from pathlib import Path

import requests
from authlib.integrations.base_client import OAuthError
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask import Flask, redirect, render_template, request, session, url_for
from flask.sessions import SecureCookieSessionInterface
from flask_wtf.csrf import CSRFProtect
from joserfc.errors import JoseError
from werkzeug.middleware.proxy_fix import ProxyFix

from providers import MOCK_ORIGIN, get_identity, register_providers

directory = Path(__file__).resolve().parent
load_dotenv(directory / ".env.local")
load_dotenv(directory / ".env")

secret_key = os.getenv("FLASK_SECRET_KEY")
if not secret_key or len(secret_key) < 32:
    raise RuntimeError(
        "Set FLASK_SECRET_KEY to a random value of at least 32 characters."
    )

app = Flask(__name__)
app.config.update(
    SECRET_KEY=secret_key,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=bool(os.getenv("VERCEL"))
    or os.getenv("FLASK_SECURE_COOKIES") == "true",
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
    SESSION_REFRESH_EACH_REQUEST=False,
)
if os.getenv("VERCEL"):
    # Vercel terminates TLS before forwarding the request to Flask.
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1)


class OAuthSessionInterface(SecureCookieSessionInterface):
    def get_cookie_samesite(self, app):
        # Apple's form_post callback needs the state cookie on a cross-site POST.
        return (
            "None" if session.get("apple_pending") else super().get_cookie_samesite(app)
        )

    def get_cookie_secure(self, app):
        return bool(session.get("apple_pending")) or super().get_cookie_secure(app)


app.session_interface = OAuthSessionInterface()
csrf = CSRFProtect(app)
oauth = OAuth(app)
providers = register_providers(oauth)


@app.get("/")
def index():
    return render_template(
        "index.html",
        user=session.get("user"),
        error=request.args.get("error"),
        mock_origin=MOCK_ORIGIN,
        providers=providers,
    )


@app.post("/sign-in")
def sign_in():
    provider = request.form.get("provider")
    if provider not in providers:
        return redirect(url_for("index", error="sign-in"))
    client = oauth.create_client(provider)
    try:
        response = client.authorize_redirect(
            url_for("callback", provider=provider, _external=True)
        )
    except (OAuthError, requests.RequestException):
        return redirect(url_for("index", error="sign-in"))
    if provider == "apple":
        session["apple_pending"] = True
    return response


@app.get("/auth/<provider>/callback")
def callback(provider):
    if provider == "apple":
        return redirect(url_for("index", error="sign-in"))
    return complete_sign_in(provider)


@app.post("/auth/apple/callback")
@csrf.exempt
def apple_callback():
    session.pop("apple_pending", None)
    if request.form.get("error") or not request.form.get("code"):
        return redirect(url_for("index", error="sign-in"))
    return complete_sign_in("apple")


def complete_sign_in(provider):
    if provider not in providers:
        return redirect(url_for("index", error="sign-in"))
    client = oauth.create_client(provider)
    try:
        token = client.authorize_access_token()
        subject, email = get_identity(provider, client, token)
    except (OAuthError, JoseError, requests.RequestException):
        return redirect(url_for("index", error="sign-in"))

    if not subject:
        return redirect(url_for("index", error="sign-in"))

    session.clear()
    session.permanent = True
    session["user"] = {"provider": provider, "sub": str(subject), "email": email}
    return redirect(url_for("index"))


@app.post("/sign-out")
def sign_out():
    session.clear()
    return redirect(url_for("index"))
