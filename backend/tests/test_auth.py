def test_register_creates_account_and_returns_tokens(client):
    res = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Jane Owner", "email": "jane@example.com", "password": "StrongPass1"},
    )
    assert res.status_code == 201
    body = res.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_register_rejects_duplicate_email(client):
    payload = {"full_name": "Jane Owner", "email": "dupe@example.com", "password": "StrongPass1"}
    client.post("/api/v1/auth/register", json=payload)
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 409


def test_login_succeeds_with_correct_credentials(client, registered_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": registered_user["password"]},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_rejects_invalid_credentials(client, registered_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": "wrong-password"},
    )
    assert res.status_code == 401


def test_me_requires_authentication(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_me_returns_current_user(client, auth_headers, registered_user):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == registered_user["email"]
