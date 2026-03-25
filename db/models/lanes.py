"""ARC-001: Lane budgets — controls promotion between discovery, qualification, and contact."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey
from db.models.enums import Lane


class LaneBudget(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "lane_budgets"

    lane: Mapped[str] = mapped_column(String(30), nullable=False)
    scope: Mapped[str] = mapped_column(String(100), nullable=False, default="global")
    daily_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=10000)
    hourly_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    used_today: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    used_this_hour: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    daily_reset_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    hourly_reset_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    hard_pause: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    __table_args__ = (
        # one budget row per lane+scope combination
        {"comment": "Budget controls for discovery/qualification/contact lanes"},
    )
