def _create_transaction(client, headers, business_id, **overrides):
    payload = {
        "type": "expense",
        "amount": "1000.00",
        "description": "Test transaction",
        "transaction_date": "2026-10-10",
        "payment_method": "cash",
    }
    payload.update(overrides)
    res = client.post(f"/api/v1/businesses/{business_id}/transactions", json=payload, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def test_create_report_requires_authentication(client, business):
    res = client.post(
        f"/api/v1/businesses/{business['id']}/reports",
        json={"report_type": "financial_summary", "format": "pdf", "period_start": "2026-10-01", "period_end": "2026-10-31"},
    )
    assert res.status_code == 401


def test_create_report_rejects_invalid_type(client, auth_headers, business):
    res = client.post(
        f"/api/v1/businesses/{business['id']}/reports",
        json={"report_type": "nonsense", "format": "pdf", "period_start": "2026-10-01", "period_end": "2026-10-31"},
        headers=auth_headers,
    )
    assert res.status_code == 422


def test_generate_and_download_pdf_financial_summary(client, auth_headers, business):
    business_id = business["id"]
    _create_transaction(client, auth_headers, business_id, type="sale", amount="50000.00")
    _create_transaction(client, auth_headers, business_id, type="expense", amount="20000.00")

    create = client.post(
        f"/api/v1/businesses/{business_id}/reports",
        json={"report_type": "financial_summary", "format": "pdf", "period_start": "2026-10-01", "period_end": "2026-10-31"},
        headers=auth_headers,
    )
    assert create.status_code == 201, create.text
    report_id = create.json()["id"]

    download = client.get(f"/api/v1/businesses/{business_id}/reports/{report_id}/download", headers=auth_headers)
    assert download.status_code == 200
    assert download.headers["content-type"] == "application/pdf"
    assert download.content.startswith(b"%PDF")
    assert len(download.content) > 100


def test_generate_and_download_excel_expense_report(client, auth_headers, business):
    business_id = business["id"]
    _create_transaction(client, auth_headers, business_id, type="expense", amount="15000.00")

    create = client.post(
        f"/api/v1/businesses/{business_id}/reports",
        json={"report_type": "expenses", "format": "excel", "period_start": "2026-10-01", "period_end": "2026-10-31"},
        headers=auth_headers,
    )
    assert create.status_code == 201
    report_id = create.json()["id"]

    download = client.get(f"/api/v1/businesses/{business_id}/reports/{report_id}/download", headers=auth_headers)
    assert download.status_code == 200
    assert download.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert download.content.startswith(b"PK")


def test_list_reports_returns_history(client, auth_headers, business):
    business_id = business["id"]
    client.post(
        f"/api/v1/businesses/{business_id}/reports",
        json={"report_type": "sales", "format": "pdf", "period_start": "2026-10-01", "period_end": "2026-10-31"},
        headers=auth_headers,
    )
    res = client.get(f"/api/v1/businesses/{business_id}/reports", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_download_rejects_another_users_business(client, auth_headers, business):
    create = client.post(
        f"/api/v1/businesses/{business['id']}/reports",
        json={"report_type": "financial_summary", "format": "pdf", "period_start": "2026-10-01", "period_end": "2026-10-31"},
        headers=auth_headers,
    )
    report_id = create.json()["id"]

    other = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Other Owner", "email": "reports-intruder@example.com", "password": "StrongPass1"},
    )
    other_headers = {"Authorization": f"Bearer {other.json()['access_token']}"}

    res = client.get(f"/api/v1/businesses/{business['id']}/reports/{report_id}/download", headers=other_headers)
    assert res.status_code == 404
