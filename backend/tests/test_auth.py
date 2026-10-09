from fastapi.testclient import TestClient

from app.main import app


def test_register_requires_valid_email():
    with TestClient(app) as client:
        response = client.post(
            "/auth/register",
            json={
                "email": "not-an-email",
                "password": "password123",
                "first_name": "Test",
                "last_name": "User",
            },
        )

    assert response.status_code == 422

def test_short_password_is_rejected():
    with TestClient(app) as client:
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "123",
                "first_name": "Test",
                "last_name": "User",
            },
        )

    assert response.status_code == 422

def test_users_me_requires_authentication():
    with TestClient(app) as client:
        response = client.get("/users/me")

    assert response.status_code == 401