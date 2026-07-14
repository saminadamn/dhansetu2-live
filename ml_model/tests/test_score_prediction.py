import pytest
from score_prediction import ScorePredictor

# These tests load the REAL trained .pkl models (not mocks) — the same
# artifacts the deployed service uses — so a broken retrain or a corrupted
# artifact shows up here, not just in production.

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


@pytest.fixture(scope="module")
def predictor():
    return ScorePredictor()


def test_predict_returns_two_floats(predictor):
    rep, inc = predictor.predict(SAMPLE_INPUT)
    assert isinstance(rep, float)
    assert isinstance(inc, float)


def test_predict_is_deterministic_for_the_same_input(predictor):
    rep1, inc1 = predictor.predict(SAMPLE_INPUT)
    rep2, inc2 = predictor.predict(SAMPLE_INPUT)
    assert rep1 == rep2
    assert inc1 == inc2


def test_predict_handles_missing_optional_fields_via_imputation(predictor):
    partial_input = {k: v for k, v in SAMPLE_INPUT.items() if k not in ("bank_balance_median", "asset_owned_count")}
    rep, inc = predictor.predict(partial_input)
    assert isinstance(rep, float)
    assert isinstance(inc, float)


def test_explain_returns_expected_schema(predictor):
    explanation = predictor.explain(SAMPLE_INPUT)
    assert "repayment_contributors" in explanation
    assert "income_contributors" in explanation
    assert isinstance(explanation["repayment_contributors"], list)
    assert isinstance(explanation["income_contributors"], list)


def test_explain_contributors_have_feature_and_impact_keys(predictor):
    explanation = predictor.explain(SAMPLE_INPUT)
    for contributor in explanation["repayment_contributors"] + explanation["income_contributors"]:
        assert "feature" in contributor
        assert "impact" in contributor
        assert isinstance(contributor["impact"], float)


def test_explain_contributors_are_sorted_by_absolute_impact_descending(predictor):
    explanation = predictor.explain(SAMPLE_INPUT)
    for key in ("repayment_contributors", "income_contributors"):
        impacts = [abs(c["impact"]) for c in explanation[key]]
        assert impacts == sorted(impacts, reverse=True)


def test_explain_only_uses_features_from_the_correct_feature_list(predictor):
    explanation = predictor.explain(SAMPLE_INPUT)
    rep_features = {c["feature"] for c in explanation["repayment_contributors"]}
    inc_features = {c["feature"] for c in explanation["income_contributors"]}
    assert rep_features.issubset(set(predictor.repayment_features))
    assert inc_features.issubset(set(predictor.income_features))
