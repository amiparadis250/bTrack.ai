def _register_and_create_business(client, email):
    register = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Other Owner", "email": email, "password": "StrongPass1"},
    )
    headers = {"Authorization": f"Bearer {register.json()['access_token']}"}
    business = client.post(
        "/api/v1/businesses",
        json={"name": "Musanze Coffee Shop", "business_type": "food_beverage", "currency": "RWF"},
        headers=headers,
    )
    return headers, business.json()


def test_user_cannot_access_another_users_business(client, auth_headers, business):
    other_headers, _ = _register_and_create_business(client, "other-owner@example.com")

    res = client.get(f"/api/v1/businesses/{business['id']}", headers=other_headers)
    assert res.status_code == 404


def test_user_cannot_list_another_users_transactions(client, auth_headers, business):
    client.post(
        f"/api/v1/businesses/{business['id']}/transactions",
        json={
            "type": "income",
            "amount": "10000.00",
            "description": "Service fee",
            "transaction_date": "2026-09-01",
            "payment_method": "bank",
        },
        headers=auth_headers,
    )

    other_headers, _ = _register_and_create_business(client, "intruder@example.com")
    res = client.get(f"/api/v1/businesses/{business['id']}/transactions", headers=other_headers)
    assert res.status_code == 404


def test_user_cannot_create_transaction_on_another_users_business(client, business):
    other_headers, _ = _register_and_create_business(client, "intruder2@example.com")
    res = client.post(
        f"/api/v1/businesses/{business['id']}/transactions",
        json={
            "type": "income",
            "amount": "10000.00",
            "description": "Should fail",
            "transaction_date": "2026-09-01",
            "payment_method": "bank",
        },
        headers=other_headers,
    )
    assert res.status_code == 404
