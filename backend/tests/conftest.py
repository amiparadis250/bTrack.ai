import os
import uuid

os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault(
    "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/btrack_test"
)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.config import get_settings
from app.main import app

settings = get_settings()


def _admin_url(db_url: str) -> str:
    base, _, _ = db_url.rpartition("/")
    return f"{base}/postgres"


@pytest.fixture(scope="session", autouse=True)
def _ensure_test_database():
    target_db = settings.database_url.rsplit("/", 1)[-1]
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
