from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
import secrets

BASE_DIR = Path(__file__).resolve().parent.parent.parent
_DEVELOPMENT_TOKEN_SECRET = secrets.token_urlsafe(48)


class Settings(BaseSettings):
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase/credentials.json"
    ENABLE_DEMO_MODE: bool = True
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "sih_platform_jwt_secret_dev_2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Resend & Transactional Email Configuration
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "SII Platform <onboarding@resend.dev>"

    # OTP Security Parameters
    OTP_EXPIRY_MINUTES: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() in {"production", "prod"}

    def get_token_secret(self) -> str:
        """Return the access-token signing key without ever falling back to an unshared random value."""
        configured_secret = (self.SECRET_KEY or "").strip()
        if configured_secret and not configured_secret.startswith("replace-with-"):
            return configured_secret
        if self.is_production:
            raise RuntimeError(
                "SECRET_KEY must be configured with a strong, non-placeholder value in production."
            )
        return "sih_platform_jwt_secret_dev_2026"

    def validate_runtime_configuration(self, firebase_available: bool) -> None:
        """Fail closed for invalid production deployments, while preserving local demo mode."""
        self.get_token_secret()
        if not self.ENABLE_DEMO_MODE and not firebase_available:
            raise RuntimeError(
                "Firebase credentials are required when ENABLE_DEMO_MODE is false."
            )

    def get_firebase_credentials_path(self) -> str:
        raw_path = self.FIREBASE_SERVICE_ACCOUNT_PATH
        p = Path(raw_path)
        if p.is_absolute() and p.exists():
            return str(p)
        if (BASE_DIR / raw_path).exists():
            return str(BASE_DIR / raw_path)
        if p.exists():
            return str(p)
        if (Path.cwd() / "Backend" / raw_path).exists():
            return str(Path.cwd() / "Backend" / raw_path)
        return raw_path

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
