"""SIE-105: Job-board adapters — Greenhouse, Lever, Ashby. Normalize postings
into raw signals for downstream security/compliance role detection."""

import re
from dataclasses import dataclass, field
from typing import Optional

import httpx


@dataclass
class JobPosting:
    board: str
    company_domain: str
    job_id: str
    title: str
    department: str | None = None
    location: str | None = None
    url: str = ""
    seniority_hint: str | None = None
    is_security_compliance: bool = False


SECURITY_KEYWORDS = re.compile(
    r"\b(security|compliance|grc|soc\s*2|iso\s*27001|privacy|trust|infosec|"
    r"information\s*security|cybersecurity|audit|risk|data\s*protection)\b",
    re.IGNORECASE,
)

SENIORITY_PATTERNS = [
    (re.compile(r"\b(vp|vice\s*president|head\s*of|director)\b", re.I), "senior_leadership"),
    (re.compile(r"\b(senior|sr\.?|lead|principal|staff)\b", re.I), "senior"),
    (re.compile(r"\b(manager|team\s*lead)\b", re.I), "manager"),
    (re.compile(r"\b(junior|jr\.?|associate|entry)\b", re.I), "junior"),
]


def _detect_seniority(title: str) -> str | None:
    for pattern, level in SENIORITY_PATTERNS:
        if pattern.search(title):
            return level
    return None


def _is_security_role(title: str, department: str | None) -> bool:
    text = f"{title} {department or ''}"
    return bool(SECURITY_KEYWORDS.search(text))


async def fetch_greenhouse(
    company_slug: str, domain: str, client: httpx.AsyncClient | None = None
) -> list[JobPosting]:
    own = client is None
    if own:
        client = httpx.AsyncClient(timeout=20)
    try:
        url = f"https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs"
        resp = await client.get(url)
        if resp.status_code != 200:
            return []
        data = resp.json()
        jobs: list[JobPosting] = []
        for j in data.get("jobs", []):
            title = j.get("title", "")
            dept_list = j.get("departments", [])
            dept = dept_list[0].get("name") if dept_list else None
            loc = j.get("location", {}).get("name")
            posting = JobPosting(
                board="greenhouse",
                company_domain=domain,
                job_id=str(j.get("id", "")),
                title=title,
                department=dept,
                location=loc,
                url=j.get("absolute_url", ""),
                seniority_hint=_detect_seniority(title),
                is_security_compliance=_is_security_role(title, dept),
            )
            jobs.append(posting)
        return jobs
    except Exception:
        return []
    finally:
        if own:
            await client.aclose()


async def fetch_lever(
    company_slug: str, domain: str, client: httpx.AsyncClient | None = None
) -> list[JobPosting]:
    own = client is None
    if own:
        client = httpx.AsyncClient(timeout=20)
    try:
        url = f"https://api.lever.co/v0/postings/{company_slug}"
        resp = await client.get(url)
        if resp.status_code != 200:
            return []
        data = resp.json()
        jobs: list[JobPosting] = []
        for j in data:
            title = j.get("text", "")
            cat = j.get("categories", {})
            dept = cat.get("department") or cat.get("team")
            loc = cat.get("location")
            posting = JobPosting(
                board="lever",
                company_domain=domain,
                job_id=j.get("id", ""),
                title=title,
                department=dept,
                location=loc,
                url=j.get("hostedUrl", ""),
                seniority_hint=_detect_seniority(title),
                is_security_compliance=_is_security_role(title, dept),
            )
            jobs.append(posting)
        return jobs
    except Exception:
        return []
    finally:
        if own:
            await client.aclose()


async def fetch_ashby(
    company_slug: str, domain: str, client: httpx.AsyncClient | None = None
) -> list[JobPosting]:
    own = client is None
    if own:
        client = httpx.AsyncClient(timeout=20)
    try:
        url = f"https://api.ashbyhq.com/posting-api/job-board/{company_slug}"
        resp = await client.get(url)
        if resp.status_code != 200:
            return []
        data = resp.json()
        jobs: list[JobPosting] = []
        for j in data.get("jobs", []):
            title = j.get("title", "")
            dept = j.get("departmentName")
            loc = j.get("locationName")
            posting = JobPosting(
                board="ashby",
                company_domain=domain,
                job_id=j.get("id", ""),
                title=title,
                department=dept,
                location=loc,
                url=j.get("jobUrl", ""),
                seniority_hint=_detect_seniority(title),
                is_security_compliance=_is_security_role(title, dept),
            )
            jobs.append(posting)
        return jobs
    except Exception:
        return []
    finally:
        if own:
            await client.aclose()


JOB_BOARD_FETCHERS = {
    "greenhouse": fetch_greenhouse,
    "lever": fetch_lever,
    "ashby": fetch_ashby,
}
