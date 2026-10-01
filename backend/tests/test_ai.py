from unittest.mock import patch

from app.services import ai_service


def test_chat_requires_authentication(client, business):
    res = client.post(f"/api/v1/businesses/{business['id']}/ai/chat", json={"message": "How much did I spend?"})
    assert res.status_code == 401


def test_chat_rejects_another_users_business(client, business):
    other = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Other Owner", "email": "ai-intruder@example.com", "password": "StrongPass1"},
    )
    other_headers = {"Authorization": f"Bearer {other.json()['access_token']}"}

    res = client.post(
        f"/api/v1/businesses/{business['id']}/ai/chat",
        json={"message": "How much did I spend?"},
        headers=other_headers,
    )
    assert res.status_code == 404


def test_chat_returns_grounded_answer_when_ai_available(client, auth_headers, business):
    with patch.object(ai_service, "ask", return_value="You spent RWF 80,000 this month."):
        res = client.post(
            f"/api/v1/businesses/{business['id']}/ai/chat",
            json={"message": "How much did I spend this month?"},
            headers=auth_headers,
        )
    assert res.status_code == 200
    assert res.json()["answer"] == "You spent RWF 80,000 this month."


def test_chat_degrades_gracefully_when_ai_unavailable(client, auth_headers, business):
    with patch.object(ai_service, "ask", side_effect=ai_service.AIUnavailableError("down")):
        res = client.post(
            f"/api/v1/businesses/{business['id']}/ai/chat",
            json={"message": "How much did I spend this month?"},
            headers=auth_headers,
        )
    assert res.status_code == 503
    assert res.json()["success"] is False


def test_resolve_period_this_month():
    from datetime import date

    start, end = ai_service.resolve_period("this_month", today=date(2026, 10, 15))
    assert start == date(2026, 10, 1)
    assert end == date(2026, 10, 15)


def test_resolve_period_last_month():
    from datetime import date

    start, end = ai_service.resolve_period("last_month", today=date(2026, 10, 15))
    assert start == date(2026, 9, 1)
    assert end == date(2026, 9, 30)
