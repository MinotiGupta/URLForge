import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch

from app.main import app
from app.database import Base, get_db

# Use SQLite in-memory for tests
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def patch_redis():
    with patch("app.services.cache_service.get_redis") as mock:
        mock.return_value.get.return_value = None
        mock.return_value.setex.return_value = True
        mock.return_value.delete.return_value = True
        mock.return_value.pipeline.return_value.__enter__ = lambda s: s
        mock.return_value.pipeline.return_value.__exit__ = lambda *a: None
        yield mock


def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_signup_and_login():
    resp = client.post("/api/auth/signup", json={"email": "test@example.com", "password": "password123"})
    assert resp.status_code == 201
    assert resp.json()["email"] == "test@example.com"

    resp = client.post("/api/auth/login", data={"username": "test@example.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_duplicate_signup():
    client.post("/api/auth/signup", json={"email": "dup@example.com", "password": "pass"})
    resp = client.post("/api/auth/signup", json={"email": "dup@example.com", "password": "pass"})
    assert resp.status_code == 400


def test_shorten_url_unauthenticated():
    resp = client.post("/api/shorten", json={"original_url": "https://openai.com"})
    assert resp.status_code == 201
    data = resp.json()
    assert "short_code" in data
    assert data["click_count"] == 0


def test_shorten_with_custom_alias():
    resp = client.post("/api/shorten", json={"original_url": "https://github.com", "custom_alias": "mygh"})
    assert resp.status_code == 201
    assert resp.json()["short_code"] == "mygh"


def test_shorten_duplicate_alias():
    client.post("/api/shorten", json={"original_url": "https://x.com", "custom_alias": "dupe"})
    resp = client.post("/api/shorten", json={"original_url": "https://y.com", "custom_alias": "dupe"})
    assert resp.status_code == 400


def test_list_urls_requires_auth():
    resp = client.get("/api/urls")
    assert resp.status_code == 401


def get_auth_header(email="user2@example.com", password="pass123"):
    client.post("/api/auth/signup", json={"email": email, "password": password})
    r = client.post("/api/auth/login", data={"username": email, "password": password})
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_urls_authenticated():
    headers = get_auth_header("user3@example.com", "pass123")
    resp = client.get("/api/urls", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
