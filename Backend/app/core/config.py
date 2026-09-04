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
    SECRET_KEY: str | None = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.strip().lower() in {"production", "prod"}

    def get_token_secret(self) -> str:
        """Return the access-token signing key without ever falling back to a known value."""
        configured_secret = (self.SECRET_KEY or "").strip()
        if configured_secret and not configured_secret.startswith("replace-with-"):
            return configured_secret
        if self.is_production:
            raise RuntimeError(
                "SECRET_KEY must be configured with a strong, non-placeholder value in production."
            )
        # A per-process value makes local/demo sessions safe from token forgery across processes.
        return _DEVELOPMENT_TOKEN_SECRET

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
