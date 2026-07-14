from utils.insights import humanize_feature, generate_insights


def test_humanize_known_feature():
    assert humanize_feature("on_time_payment_ratio") == "on-time payment ratio"
    assert humanize_feature("declared_monthly_income") == "declared monthly income"


def test_humanize_unknown_feature_falls_back_to_readable_snake_case():
    assert humanize_feature("some_new_feature_xyz") == "some new feature xyz"


def test_generate_insights_direction_wording():
    contributors = [
        {"feature": "on_time_payment_ratio", "impact": 3.5},
        {"feature": "past_defaults", "impact": -2.1},
    ]
    insights = generate_insights(contributors, "repayment score")

    assert len(insights) == 2
    assert "increased" in insights[0]
    assert "on-time payment ratio" in insights[0]
    assert "reduced" in insights[1]
    assert "past loan defaults" in insights[1]


def test_generate_insights_respects_limit():
    contributors = [{"feature": f"feature_{i}", "impact": i} for i in range(10)]
    insights = generate_insights(contributors, "income proxy score", limit=3)
    assert len(insights) == 3


def test_generate_insights_handles_empty_contributors():
    assert generate_insights([], "repayment score") == []


def test_generate_insights_zero_impact_is_treated_as_not_increased():
    contributors = [{"feature": "household_size", "impact": 0}]
    insights = generate_insights(contributors, "income proxy score")
    assert "reduced" in insights[0]  # impact > 0 is False for 0, so falls to "reduced"
