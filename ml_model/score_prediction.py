import joblib
import pandas as pd
import numpy as np

class ScorePredictor:
    def __init__(self):
        self.rep_model = joblib.load("ml_model/repayment_model.pkl")
        self.inc_model = joblib.load("ml_model/income_model.pkl")
        self.label_encoders = joblib.load("ml_model/label_encoders.pkl")
        self.knn_imputer = joblib.load("ml_model/knn_imputer.pkl")
        self.group_medians = joblib.load("ml_model/group_medians.pkl")

        # Feature lists
        self.repayment_features = [
            "num_past_loans", "past_defaults", "late_payments_count", "avg_days_past_due",
            "on_time_payment_ratio", "repayment_regular_for_last_6m", "utilization_ratio",
            "current_outstanding_balance", "active_loans_count", "emi_bounce_count",
            "field_officer_repayment_rating", "income_to_loan_ratio", "monthly_obligation_ratio",
            "declared_monthly_income", "bank_avg_monthly_inflow", "bank_balance_median"
        ]

        self.income_features = [
            "declared_monthly_income", "bank_avg_monthly_inflow", "bank_balance_median",
            "transaction_count_monthly", "electricity_units", "mobile_recharge_amount",
            "asset_owned_count", "ration_card_type", "household_size", "occupation_type",
            "education_level", "district_poverty_index"
        ]

        # Combine without duplicates preserving order
        self.imputer_features = []
        for col in self.repayment_features + self.income_features:
            if col not in self.imputer_features:
                self.imputer_features.append(col)

    def preprocess(self, input_dict):
        df = pd.DataFrame([input_dict])

        # Ensure missing columns exist with NaN
        for col in self.imputer_features:
            if col not in df.columns:
                df[col] = np.nan

        # Apply label encoders
        for col, enc in self.label_encoders.items():
            df[col] = df[col].astype(str).apply(
                lambda x: enc.transform([x])[0] if x in enc.classes_ else -1
            )

        # Apply KNN Imputer (correct feature order)
        df[self.imputer_features] = self.knn_imputer.transform(df[self.imputer_features])

        return df

    def predict(self, input_dict):
        df = self.preprocess(input_dict)

        rep = float(self.rep_model.predict(df[self.repayment_features])[0])
        inc = float(self.inc_model.predict(df[self.income_features])[0])

        return rep, inc
