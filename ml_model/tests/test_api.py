import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_INPUT = {
    "ration_card_type": "BPL",
    "household_size": 4,
    "occupation_type": "Daily Wage",
    "education_level": "Primary",
    "district": "Test District",
    "num_past_loans": 2,
    "past_defaults": 0,
    "late_payments_count": 1,
    "avg_days_past_due": 3,
    "on_time_payment_ratio": 0.9,
    "repayment_regular_for_last_6m": 1,
    "utilization_ratio": 0.4,
    "current_outstanding_balance": 5000,
    "active_loans_count": 1,
    "emi_bounce_count": 0,
    "field_officer_repayment_rating": 4,
    "declared_monthly_income": 12000,
    "bank_avg_monthly_inflow": 11000,
    "bank_balance_median": 2000,
    "transaction_count_monthly": 15,
    "electricity_units": 120,
    "mobile_recharge_amount": 200,
    "asset_owned_count": 2,
    "district_poverty_index": 0.5,
    "income_to_loan_ratio": 2.4,
    "monthly_obligation_ratio": 0.3,
}


def test_predict_returns_200_with_full_schema():
    res = client.post("/predict", json=SAMPLE_INPUT)
    assert res.status_code == 200

    body = res.json()
    for key in ("repayment_score", "income_proxy_score", "ccs", "risk_band", "explanation"):
        assert key in body

    assert isinstance(body["repayment_score"], float)
    assert isinstance(body["income_proxy_score"], float)
    assert isinstance(body["ccs"], float)
    assert body["risk_band"] in [
        "Low Risk – High Priority",
        "Low Risk – Low Priority",
        "High Risk – High Need",
        "High Risk – Low Need",
    ]


def test_predict_explanation_schema():
    res = client.post("/predict", json=SAMPLE_INPUT)
    explanation = res.json()["explanation"]

    assert "repayment_contributors" in explanation
    assert "income_contributors" in explanation
    assert "insights" in explanation
    assert isinstance(explanation["insights"], list)
    assert all(isinstance(s, str) for s in explanation["insights"])


def test_predict_ccs_matches_weighted_formula():
    res = client.post("/predict", json=SAMPLE_INPUT)
    body = res.json()
    expected_ccs = 0.6 * body["repayment_score"] + 0.4 * body["income_proxy_score"]
    assert body["ccs"] == pytest.approx(expected_ccs, abs=0.01)


def test_metrics_endpoint_is_exposed():
    res = client.get("/metrics")
    assert res.status_code == 200
    assert "python_gc_objects_collected_total" in res.text
