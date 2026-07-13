from fastapi import FastAPI
from score_prediction import ScorePredictor
from utils.risk_band import calculate_ccs_and_band
from utils.insights import generate_insights

app = FastAPI(title="Dhansetu ML Service")
predictor = ScorePredictor()

@app.post("/predict")
def predict(input_data: dict):
    rep, inc = predictor.predict(input_data)
    ccs, band = calculate_ccs_and_band(rep, inc)

    explanation = predictor.explain(input_data)
    insights = generate_insights(explanation["repayment_contributors"], "repayment score") + \
        generate_insights(explanation["income_contributors"], "income proxy score")

    return {
        "repayment_score": rep,
        "income_proxy_score": inc,
        "ccs": ccs,
        "risk_band": band,
        "explanation": {
            "repayment_contributors": explanation["repayment_contributors"],
            "income_contributors": explanation["income_contributors"],
            "insights": insights,
        },
    }
