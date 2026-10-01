from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    # Neon's serverless compute auto-suspends after a few minutes of inactivity; a pooled
    # connection left open across a suspend hangs instead of failing (the socket looks fine
    # locally, the far end is just gone). Recycling proactively avoids ever trying to reuse
    # one, and connect_timeout caps how long a fresh connect waits while Neon cold-starts.
    pool_recycle=240,
    connect_args={"connect_timeout": 10},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
