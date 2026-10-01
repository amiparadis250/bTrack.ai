def _create_transaction(client, headers, business_id, **overrides):
    payload = {
        "type": "expense",
        "amount": "1000.00",
        "description": "Test transaction",
        "transaction_date": "2026-09-15",
        "payment_method": "cash",
    }
    payload.update(overrides)
    res = client.post(f"/api/v1/businesses/{business_id}/transactions", json=payload, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def test_overview_computes_revenue_expenses_profit_and_cash_flow(client, auth_headers, business):
    business_id = business["id"]
    _create_transaction(client, auth_headers, business_id, type="income", amount="5000000.00")
    _create_transaction(client, auth_headers, business_id, type="sale", amount="2000000.00")
    _create_transaction(client, auth_headers, business_id, type="expense", amount="2140000.00")

    res = client.get(
        f"/api/v1/businesses/{business_id}/analytics/overview",
        params={"date_from": "2026-09-01", "date_to": "2026-09-30"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["revenue"] == "7000000.00"
    assert body["expenses"] == "2140000.00"
    assert body["profit"] == "4860000.00"
    assert body["net_cash_flow"] == "4860000.00"
    assert round(body["profit_margin"], 2) == 69.43


def test_overview_handles_zero_revenue_without_error(client, auth_headers, business):
    business_id = business["id"]
    _create_transaction(client, auth_headers, business_id, type="expense", amount="500.00")

    res = client.get(
        f"/api/v1/businesses/{business_id}/analytics/overview",
        params={"date_from": "2026-09-01", "date_to": "2026-09-30"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["revenue"] == "0.00"
    assert body["profit_margin"] is None


def test_expense_breakdown_groups_by_category_with_percentage(client, auth_headers, business):
    business_id = business["id"]
    categories = client.get(f"/api/v1/businesses/{business_id}/categories", headers=auth_headers).json()
    inventory = next(c for c in categories if c["name"] == "Inventory")
    rent = next(c for c in categories if c["name"] == "Rent")

    _create_transaction(client, auth_headers, business_id, amount="600.00", category_id=inventory["id"])
    _create_transaction(client, auth_headers, business_id, amount="400.00", category_id=rent["id"])

    res = client.get(
        f"/api/v1/businesses/{business_id}/analytics/expense-breakdown",
        params={"date_from": "2026-09-01", "date_to": "2026-09-30"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    items = {item["category_name"]: item["percentage"] for item in res.json()}
    assert items["Inventory"] == 60.0
    assert items["Rent"] == 40.0
