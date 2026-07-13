FEATURE_LABELS = {
    "num_past_loans": "number of past loans",
    "past_defaults": "past loan defaults",
    "late_payments_count": "count of late payments",
    "avg_days_past_due": "average days past due",
    "on_time_payment_ratio": "on-time payment ratio",
    "repayment_regular_for_last_6m": "repayment regularity over the last 6 months",
    "utilization_ratio": "credit utilization ratio",
    "current_outstanding_balance": "current outstanding balance",
    "active_loans_count": "number of active loans",
    "emi_bounce_count": "EMI bounce count",
    "field_officer_repayment_rating": "field officer's repayment rating",
    "income_to_loan_ratio": "income-to-loan ratio",
    "monthly_obligation_ratio": "monthly obligation ratio",
    "declared_monthly_income": "declared monthly income",
    "bank_avg_monthly_inflow": "average monthly bank inflow",
    "bank_balance_median": "median bank balance",
    "transaction_count_monthly": "monthly transaction count",
    "electricity_units": "electricity bill regularity",
    "mobile_recharge_amount": "mobile recharge amount",
    "asset_owned_count": "number of assets owned",
    "ration_card_type": "ration card category",
    "household_size": "household size",
    "occupation_type": "occupation type",
    "education_level": "education level",
    "district_poverty_index": "district poverty index",
}


def humanize_feature(feature):
    return FEATURE_LABELS.get(feature, feature.replace("_", " "))


def generate_insights(contributors, score_label, limit=3):
    """Turn a sorted list of {feature, impact} SHAP contributors into
    plain-English sentences for the officer explainability panel."""
    insights = []
    for c in contributors[:limit]:
        label = humanize_feature(c["feature"])
        direction = "increased" if c["impact"] > 0 else "reduced"
        insights.append(
            f"This applicant's {score_label} was {direction} by their {label}."
        )
    return insights
