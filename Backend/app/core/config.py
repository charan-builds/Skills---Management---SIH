from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase/skilling-impact-intelligence-firebase-adminsdk-fbsvc-13bc2fb95d.json"
    ENABLE_DEMO_MODE: bool = True

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