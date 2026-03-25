"""CFG-005: Typed config with boot-time validation and feature flags."""

from functools import lru_cache
from typing import Optional

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Core infrastructure ──
    database_url: str = Field(..., description="PostgreSQL async connection string")
    redis_url: str = Field(default="redis://localhost:6379/0")

    # ── Object storage ──
    minio_endpoint: str = Field(default="localhost:9000")
    minio_access_key: str = Field(default="minioadmin")
    minio_secret_key: SecretStr = Field(default=SecretStr("minioadmin"))
    minio_bucket: str = Field(default="autopilot")

    # ── Stripe ──
    stripe_secret_key: Optional[SecretStr] = None
    stripe_webhook_secret: Optional[SecretStr] = None

    # ── Mail ──
    smtp_host: Optional[str] = None
    smtp_port: int = Field(default=587)
    smtp_user: Optional[str] = None
    smtp_password: Optional[SecretStr] = None
    imap_host: Optional[str] = None
    imap_port: int = Field(default=993)
    imap_user: Optional[str] = None
    imap_password: Optional[SecretStr] = None

    # ── App ──
    app_secret_key: SecretStr = Field(default=SecretStr("change-me-in-production"))

    # ── Feature flags ──
    discovery_enabled: bool = Field(default=True)
    contact_enabled: bool = Field(default=False)
    billing_enabled: bool = Field(default=False)
    trust_copilot_enabled: bool = Field(default=False)

    def validate_boot(self) -> list[str]:
        """Return list of fatal config errors. Empty list means valid."""
        errors: list[str] = []
        if not self.database_url:
            errors.append("DATABASE_URL is required")
        if not self.redis_url:
            errors.append("REDIS_URL is required")
        if self.billing_enabled and not self.stripe_secret_key:
            errors.append("STRIPE_SECRET_KEY required when billing is enabled")
        if self.billing_enabled and not self.stripe_webhook_secret:
            errors.append("STRIPE_WEBHOOK_SECRET required when billing is enabled")
        if self.contact_enabled and not self.smtp_host:
            errors.append("SMTP_HOST required when contact lane is enabled")
        return errors


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


def validate_startup() -> None:
    """Call at boot — raises if required config is missing."""
    settings = get_settings()
    errors = settings.validate_boot()
    if errors:
        raise SystemExit(f"Boot config errors:\n" + "\n".join(f"  - {e}" for e in errors))
