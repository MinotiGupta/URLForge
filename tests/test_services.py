import pytest
from unittest.mock import MagicMock
from app.services.url_service import generate_short_code, generate_qr_code
from app.services.auth_service import get_password_hash, verify_password, create_access_token, decode_token


def test_short_code_length():
    code = generate_short_code(6)
    assert len(code) == 6
    assert code.isalnum()


def test_short_code_uniqueness():
    codes = {generate_short_code(6) for _ in range(100)}
    assert len(codes) > 90  # very high probability of uniqueness


def test_password_hashing():
    hashed = get_password_hash("mypassword")
    assert verify_password("mypassword", hashed)
    assert not verify_password("wrong", hashed)


def test_jwt_encode_decode():
    token = create_access_token({"sub": "user@example.com"})
    payload = decode_token(token)
    assert payload["sub"] == "user@example.com"


def test_invalid_jwt():
    payload = decode_token("not.a.valid.token")
    assert payload is None


def test_qr_code_generation():
    qr = generate_qr_code("https://example.com")
    assert isinstance(qr, str)
    assert len(qr) > 100  # base64 encoded PNG is large
