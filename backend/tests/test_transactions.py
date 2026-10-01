def test_create_transaction_succeeds(client, auth_headers, business):
    res = client.post(
        f"/api/v1/businesses/{business['id']}/transactions",
        json={
            "type": "expense",
            "amount": "15000.00",
            "description": "Purchased stock",
            "transaction_date": "2026-09-10",
            "payment_method": "mobile_money",
        },
        headers=auth_headers,
    )
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["amount"] == "15000.00"
    assert body["source"] == "manual"


def test_create_transaction_rejects_negative_amount(client, auth_headers, business):
    res = client.post(
        f"/api/v1/businesses/{business['id']}/transactions",
        json={
            "type": "income",
            "amount": "-500",
            "description": "Invalid",
            "transaction_date": "2026-09-10",
            "payment_method": "cash",
        },
        headers=auth_headers,
    )
    assert res.status_code == 422


def test_create_transaction_rejects_invalid_type(client, auth_headers, business):
    res = client.post(
        f"/api/v1/businesses/{business['id']}/transactions",
        json={
            "type": "refund",
            "amount": "500",
            "description": "Invalid type",
            "transaction_date": "2026-09-10",
            "payment_method": "cash",
        },
        headers=auth_headers,
    )
    assert res.status_code == 422


def test_list_read_update_delete_transaction(client, auth_headers, business):
    create = client.post(
        f"/api/v1/businesses/{business['id']}/transactions",
        json={
            "type": "sale",
            "amount": "25000.00",
            "description": "Sold 10 crates of soda",
            "transaction_date": "2026-09-12",
            "payment_method": "cash",
        },
        headers=auth_headers,
    )
    transaction_id = create.json()["id"]

    listed = client.get(f"/api/v1/businesses/{business['id']}/transactions", headers=auth_headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1

    updated = client.put(
        f"/api/v1/businesses/{business['id']}/transactions/{transaction_id}",
        json={"amount": "30000.00"},
        headers=auth_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == "30000.00"

    deleted = client.delete(
        f"/api/v1/businesses/{business['id']}/transactions/{transaction_id}", headers=auth_headers
    )
    assert deleted.status_code == 204

    after_delete = client.get(f"/api/v1/businesses/{business['id']}/transactions", headers=auth_headers)
    assert after_delete.json()["total"] == 0
