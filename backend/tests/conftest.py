import os
import uuid
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

os.environ.setdefault("SECRET_KEY", "test-secret-key")


def _read_env_database_url() -> str | None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return None
    for line in env_path.read_text().splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1].strip()
    return None


def _derive_test_database_url() -> str:
    base_url = (
        os.environ.get("DATABASE_URL")
        or _read_env_database_url()
        or "postgresql+psycopg://postgres:postgres@localhost:5432/btrack"
    )
    parts = urlsplit(base_url)
    return urlunsplit((parts.scheme, parts.netloc, f"{parts.path}_test", parts.query, parts.fragment))


os.environ["DATABASE_URL"] = _derive_test_database_url()

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.config import get_settings
from app.main import app

settings = get_settings()


def _admin_url(db_url: str) -> str:
    parts = urlsplit(db_url)
    return urlunsplit((parts.scheme, parts.netloc, "/postgres", parts.query, parts.fragment))


@pytest.fixture(scope="session", autouse=True)
def _ensure_test_database():
    target_db = urlsplit(settings.database_url).path.lstrip("/")
    admin_engine = create_engine(_admin_url(settings.database_url), isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": target_db}).first()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{target_db}"'))
    admin_engine.dispose()
    yield


@pytest.fixture()
def db_session():
    engine = create_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def registered_user(client):
    email = f"owner-{uuid.uuid4().hex[:8]}@example.com"
    password = "SuperSecret123"
    res = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Kigali Fresh Foods Owner", "email": email, "password": password},
    )
    assert res.status_code == 201, res.text
    tokens = res.json()
    return {"email": email, "password": password, "tokens": tokens}


@pytest.fixture()
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['tokens']['access_token']}"}


@pytest.fixture()
def business(client, auth_headers):
    res = client.post(
        "/api/v1/businesses",
        json={"name": "Kigali Fresh Foods", "business_type": "retail", "currency": "RWF"},
        headers=auth_headers,
    )
    assert res.status_code == 201, res.text
    return res.json()
