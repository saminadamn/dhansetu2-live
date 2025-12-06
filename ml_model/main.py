from fastapi import FastAPI
from ml_model.score_prediction import ScorePredictor
from ml_model.utils.risk_band import calculate_ccs_and_band

app = FastAPI(title="Dhansetu ML Service")
predictor = ScorePredictor()

@app.post("/predict")
def predict(input_data: dict):
    rep, inc = predictor.predict(input_data)
    ccs, band = calculate_ccs_and_band(rep, inc)
    return {
        "repayment_score": rep,
        "income_proxy_score": inc,
        "ccs": ccs,
        "risk_band": band
    }

