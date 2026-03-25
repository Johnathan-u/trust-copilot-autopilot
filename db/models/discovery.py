"""SIE-101 / SIE-108: Source registry, crawl jobs, and crawl metrics."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDPrimaryKey


class SourceEntry(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-101: Registry of crawlable source endpoints."""

    __tablename__ = "source_entries"

    source_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    url_pattern: Mapped[str] = mapped_column(String(2000), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    page_type_hint: Mapped[Optional[str]] = mapped_column(String(50))
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    recrawl_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=168)
    rate_limit_rpm: Mapped[int] = mapped_column(Integer, nullable=False, default=10)

    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_crawled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    next_crawl_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), index=True
    )
    consecutive_failures: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_error: Mapped[Optional[str]] = mapped_column(Text)
    health_score: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    config: Mapped[Optional[dict]] = mapped_column(JSONB)

    requires_js: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class CrawlJob(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-101: Individual crawl job emitted by the scheduler."""

    __tablename__ = "crawl_jobs"

    source_entry_id: Mapped[Optional[str]] = mapped_column(String(36), index=True)
    url: Mapped[str] = mapped_column(String(2000), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    page_type_hint: Mapped[Optional[str]] = mapped_column(String(50))
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    requires_js: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", index=True
    )
    claimed_by: Mapped[Optional[str]] = mapped_column(String(100))
    claimed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=3)

    http_status: Mapped[Optional[int]] = mapped_column(Integer)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    etag: Mapped[Optional[str]] = mapped_column(String(500))
    last_modified: Mapped[Optional[str]] = mapped_column(String(200))
    canonical_url: Mapped[Optional[str]] = mapped_column(String(2000))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    render_method: Mapped[Optional[str]] = mapped_column(String(20))
    fetch_ms: Mapped[Optional[int]] = mapped_column(Integer)


class CrawlMetrics(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-108: Per-domain crawl budget tracking and skip-reason counters."""

    __tablename__ = "crawl_metrics"

    domain: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    daily_budget: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    used_today: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    budget_reset_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    total_fetched: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_skipped_stale: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_skipped_duplicate: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_skipped_budget: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_retried: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_errors: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class ExtractedChunk(Base, UUIDPrimaryKey, TimestampMixin):
    """SIE-104: Clean text chunk extracted from a crawled page."""

    __tablename__ = "extracted_chunks"

    crawl_job_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    source_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    page_type: Mapped[Optional[str]] = mapped_column(String(50))
    section_title: Mapped[Optional[str]] = mapped_column(String(500))
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)
    char_offset_start: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    char_offset_end: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    extraction_method: Mapped[str] = mapped_column(
        String(30), nullable=False, default="trafilatura"
    )
