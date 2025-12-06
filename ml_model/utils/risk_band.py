def calculate_ccs_and_band(rep, inc, alpha=0.6, beta=0.4):
    """
    Composite Credit Score calculation and risk band assignment.
    """

    # Composite Credit Score
    ccs = alpha * rep + beta * inc

    # Assign risk band
    if ccs >= 75:
        band = "Low Risk – High Priority"
    elif ccs >= 60:
        band = "Low Risk – Low Priority"
    elif ccs >= 45:
        band = "High Risk – High Need"
    else:
        band = "High Risk – Low Need"

    return ccs, band
