from datetime import date, timedelta

TODAY = date.today()
LAST_MONTH_DAY = (TODAY.replace(day=1) - timedelta(days=1)).replace(day=1)


def _create_transaction(client, headers, business_id, **overrides):
    payload = {
        "type": "expense",
        "amount": "1000.00",
        "description": "Test transaction",
        "transaction_date": TODAY.isoformat(),
        "payment_method": "cash",
    }
    payload.update(overrides)
    res = client.post(f"/api/v1/businesses/{business_id}/transactions", json=payload, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def test_insights_require_authentication(client, business):
    res = client.get(f"/api/v1/businesses/{business['id']}/insights")
    assert res.status_code == 401


def test_insights_detects_revenue_growth(client, auth_headers, business):
    business_id = business["id"]
    _create_transaction(
        client, auth_headers, business_id, type="sale", amount="100000.00", transaction_date=LAST_MONTH_DAY.isoformat()
    )
    _create_transaction(
        client, auth_headers, business_id, type="sale", amount="200000.00", transaction_date=TODAY.isoformat()
    )

    res = client.get(f"/api/v1/businesses/{business_id}/insights", headers=auth_headers)
    assert res.status_code == 200
    types = [i["type"] for i in res.json()]
    assert "revenue_growth" in types


def test_insights_are_idempotent_on_repeat_calls(client, auth_headers, business):
    business_id = business["id"]
    _create_transaction(
        client, auth_headers, business_id, type="sale", amount="100000.00", transaction_date=LAST_MONTH_DAY.isoformat()
    )
    _create_transaction(
        client, auth_headers, business_id, type="sale", amount="300000.00", transaction_date=TODAY.isoformat()
    )

    first = client.get(f"/api/v1/businesses/{business_id}/insights", headers=auth_headers).json()
    second = client.get(f"/api/v1/businesses/{business_id}/insights", headers=auth_headers).json()

    first_ids = sorted(i["id"] for i in first)
    second_ids = sorted(i["id"] for i in second)
    assert first_ids == second_ids


def test_insights_reject_another_users_business(client, business):
    other = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Other Owner", "email": "insights-intruder@example.com", "password": "StrongPass1"},
    )
    other_headers = {"Authorization": f"Bearer {other.json()['access_token']}"}
    res = client.get(f"/api/v1/businesses/{business['id']}/insights", headers=other_headers)
    assert res.status_code == 404
