from utils.risk_band import calculate_ccs_and_band


def test_weighted_formula():
    # ccs = alpha*rep + beta*inc, default alpha=0.6 beta=0.4
    ccs, _ = calculate_ccs_and_band(rep=100, inc=0)
    assert ccs == 60.0

    ccs, _ = calculate_ccs_and_band(rep=0, inc=100)
    assert ccs == 40.0

    ccs, _ = calculate_ccs_and_band(rep=100, inc=100)
    assert ccs == 100.0


def test_custom_weights():
    ccs, _ = calculate_ccs_and_band(rep=100, inc=0, alpha=0.5, beta=0.5)
    assert ccs == 50.0


def test_band_boundaries_are_inclusive_on_the_low_end():
    # >= 75 -> Low Risk – High Priority
    _, band = calculate_ccs_and_band(rep=75, inc=75)
    assert band == "Low Risk – High Priority"

    # just below 75 -> next band down
    _, band = calculate_ccs_and_band(rep=74, inc=74)
    assert band == "Low Risk – Low Priority"

    # >= 60 -> Low Risk – Low Priority
    _, band = calculate_ccs_and_band(rep=60, inc=60)
    assert band == "Low Risk – Low Priority"

    _, band = calculate_ccs_and_band(rep=59, inc=59)
    assert band == "High Risk – High Need"

    # >= 45 -> High Risk – High Need
    _, band = calculate_ccs_and_band(rep=45, inc=45)
    assert band == "High Risk – High Need"

    _, band = calculate_ccs_and_band(rep=44, inc=44)
    assert band == "High Risk – Low Need"


def test_band_at_zero():
    _, band = calculate_ccs_and_band(rep=0, inc=0)
    assert band == "High Risk – Low Need"


def test_band_at_max():
    _, band = calculate_ccs_and_band(rep=100, inc=100)
    assert band == "Low Risk – High Priority"
