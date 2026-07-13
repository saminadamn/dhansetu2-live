import { useState } from "react";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import UploadCard from "../../components/ui/UploadCard.jsx";
import { useTranslation } from "react-i18next";
import VoiceInputButton from "../../components/ui/VoiceInputButton.jsx";
import SearchableDropdown from "../../components/ui/SearchableDropdown.jsx";
import BhashiniTranslate from "../../components/ui/BhashiniTranslate.jsx";
import { districts } from "../../constants/districts.js";




import API from "../../services/axiosInstance.js";
import { useNavigate } from "react-router-dom";




const TOTAL_STEPS = 4;

const fieldClass = (hasError, withVoice = false) =>
  `w-full border rounded-lg px-4 py-2.5 text-sm bg-white transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-govBlue ${
    withVoice ? "pr-10" : ""
  } ${hasError ? "border-red-500" : "border-slate-300"}`;

export default function ApplicationFormPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();

//new
const [errors, setErrors] = useState({});
const [consentGiven, setConsentGiven] = useState(false);


  // Form state aligned with backend field names
const [formData, setFormData] = useState({
  applicantName: "",
  age: "",
  gender: "",
  district: "",
  address: "",
  occupation_type: "",
  education_level: "",
  household_size: "",
  ration_card_type: "",
  aadhaarNumber: "",
  electricityBill: null,
  electricity_units: "",
  incomeCertificate: null,
  businessProof: null,
  lpgInfo: "",
  digitalPaymentsInfo: "",
});

//new
function validateStep() {
  let newErrors = {};

  if (step === 1) {
    if (!formData.applicantName.trim()) newErrors.applicantName = "Applicant name is required";

    if (!formData.age) newErrors.age = "Age is required";
    else if (formData.age < 18 || formData.age > 100)
      newErrors.age = "Enter a valid age (18–100)";

    if (!formData.gender) newErrors.gender = "Please select gender";

    if (!formData.district.trim()) newErrors.district = "District is required";

    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.aadhaarNumber) newErrors.aadhaarNumber = "Aadhaar Number required";
    else if (!/^\d{12}$/.test(formData.aadhaarNumber))
      newErrors.aadhaarNumber = "Aadhaar must be 12 digits";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}




  function updateField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
function nextStep() {
  if (!validateStep()) return; // stop if errors exist
  setStep(step + 1);
}


  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

async function handleSubmit(e) {
  e.preventDefault();

  if (!consentGiven) {
    setErrors((prev) => ({ ...prev, consent: "Account Aggregator consent is required to submit" }));
    return;
  }

  const payload = {
    applicantName: formData.applicantName,
    aadhaarNumber: formData.aadhaarNumber,
    gender: formData.gender,
    occupation_type: formData.occupation_type,
    education_level: formData.education_level,
    household_size: Number(formData.household_size || 0),
    ration_card_type: formData.ration_card_type,
    district: formData.district
  };

  try {
    const response = await API.post("/loans/apply", payload);
    console.log("Loan Application Response:", response.data);

    // response.data.async is true when the request was handed off to the
    // scoring/decision worker pipeline (RabbitMQ) — no scores yet, they'll
    // appear on "My Applications" once the workers finish. When no message
    // broker is configured, the backend falls back to scoring synchronously
    // and scores are already present in the response.
    if (!response.data.async) {
      localStorage.setItem("latestLoanScores", JSON.stringify({
        risk_score: response.data.risk_score,
        repayment_score: response.data.repayment_score,
        income_proxy_score: response.data.income_proxy_score,
        risk_band: response.data.risk_band,
      }));
    }

    // Beneficiary login doesn't collect Aadhaar (mobile+OTP only), so we
    // remember the Aadhaar used on their latest application to look up
    // "My Applications" without a backend identity-binding change.
    localStorage.setItem("aadhaarNumber", formData.aadhaarNumber);

    if (response.data.async) {
      alert("Application submitted! It's being scored now — check My Applications shortly for your result.");
    }

    navigate("/dashboard/beneficiary");  // redirect to application list after success
  } catch (error) {
    console.error("Loan application failed:", error);
    alert("Something went wrong while applying for loan!");
  }
}






  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-govBlue">
            {t("form.newApplicationTitle")}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
           {t("form.helperText")}{" "}
            <span className="text-red-600 font-semibold">*</span> {t("form.mandatory")}
          </p>
          <div className="mt-2">
            <BhashiniTranslate text="Fill the sections step by step. Fields marked with * are mandatory." />
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-govSoftBlue text-xs text-govBlue border border-blue-200 font-medium">
          {t("form.draftNote")}
        </span>
      </div>

      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 text-sm md:text-base text-slate-800"
      >
        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <section className="section-box">
            <h2 className="section-title mb-4">{t("form.personalDetails")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="applicantName" label="Applicant Name" required>
            <div className="relative">
              <input
                id="applicantName"
                type="text"
                value={formData.applicantName}
                onChange={(e) => updateField("applicantName", e.target.value)}
                className={fieldClass(errors.applicantName, true)}
              />
              <VoiceInputButton onResult={(text) => updateField("applicantName", text)} />
            </div>
            {errors.applicantName && (
              <p className="text-red-600 text-xs mt-1">{errors.applicantName}</p>
            )}
          </FormField>


              <FormField id="age" label="Age" required>
                <div className="relative">
                  <input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    className={fieldClass(errors.age, true)}
                  />
                  <VoiceInputButton onResult={(text) => updateField("age", text)} />
                </div>
                {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
              </FormField>

             <FormField id="gender" label="Gender" required>
  <div className="flex flex-col">
    <select
      id="gender"
      value={formData.gender}
      onChange={(e) => {
        const value = e.target.value;
        updateField("gender", value);

        if (!value) {
          setErrors((prev) => ({
            ...prev,
            gender: "Please select a gender"
          }));
        } else {
          setErrors((prev) => ({ ...prev, gender: "" }));
        }
      }}
      className={fieldClass(errors.gender)}
    >
      <option value="">Select</option>
      <option value="female">Female</option>
      <option value="male">Male</option>
      <option value="other">Other</option>
    </select>

    {errors.gender && (
      <p className="text-red-600 text-xs mt-1">{errors.gender}</p>
    )}
  </div>
</FormField>


              <FormField id="district" label="District" required>
              <SearchableDropdown
                label=""
                value={formData.district}
                options={districts}
                onChange={(value) => updateField("district", value)}
                className={fieldClass(errors.district)}
              />
</FormField>
            </div>

            <FormField id="address" label="Address" required>
              <textarea
                id="address"
                rows="2"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={fieldClass(errors.address)}

              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField id="occupation_type" label="Occupation Type" required>
  <div className="flex flex-col">
    <select
      id="occupation_type"
      value={formData.occupation_type}
      onChange={(e) => {
        const value = e.target.value;
        updateField("occupation_type", value);

        if (!value) {
          setErrors((prev) => ({
            ...prev,
            occupation_type: "Please select an occupation type",
          }));
        } else {
          setErrors((prev) => ({ ...prev, occupation_type: "" }));
        }
      }}
      className={fieldClass(errors.occupation_type)}
    >
      <option value="">Select</option>
      <option value="Farmer">Farmer</option>
      <option value="Daily Wage">Daily Wage</option>
      <option value="Self Employed">Self Employed</option>
      <option value="Private Job">Private Job</option>
      <option value="Govt Job">Govt Job</option>
    </select>

    {errors.occupation_type && (
      <p className="text-red-600 text-xs mt-1">{errors.occupation_type}</p>
    )}
  </div>
</FormField>


              <FormField id="education_level" label="Education Level" required>
  <div className="flex flex-col">
    <select
      id="education_level"
      value={formData.education_level}
      onChange={(e) => {
        const value = e.target.value;
        updateField("education_level", value);

        if (!value) {
          setErrors((prev) => ({
            ...prev,
            education_level: "Please select an education level",
          }));
        } else {
          setErrors((prev) => ({ ...prev, education_level: "" }));
        }
      }}
      className={fieldClass(errors.education_level)}
    >
      <option value="">Select</option>
      <option value="Illiterate">Illiterate</option>
      <option value="Primary">Primary</option>
      <option value="Secondary">Secondary</option>
      <option value="Graduate ">Graduate </option>

    </select>

    {errors.education_level && (
      <p className="text-red-600 text-xs mt-1">{errors.education_level}</p>
    )}
  </div>
</FormField>


              <FormField
                id="household_size"
                label="Household Size"
                required
                hint="Number of people supported by this income."
              >
                <div className="relative">
                  <input
                    id="household_size"
                    type="number"
                    min="1"
                    value={formData.household_size}
                    onChange={(e) =>
                      updateField("household_size", e.target.value)
                    }
                    className={fieldClass(false, true)}
                  />
                  <VoiceInputButton onResult={(text) => updateField("household_size", text)} />
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField id="ration_card_type" label="Ration Card Type" required>
  <div className="flex flex-col">
    <select
      id="ration_card_type"
      value={formData.ration_card_type}
      onChange={(e) => {
        const value = e.target.value;
        updateField("ration_card_type", value);

        if (!value) {
          setErrors((prev) => ({
            ...prev,
            ration_card_type: "Please select a ration card type",
          }));
        } else {
          setErrors((prev) => ({ ...prev, ration_card_type: "" }));
        }
      }}
      className={fieldClass(errors.ration_card_type)}
    >
      <option value="">Select</option>
      <option value="APL">APL</option>
      <option value="BPL">BPL</option>
      <option value="AAY">AAY</option>
    </select>

    {errors.ration_card_type && (
      <p className="text-red-600 text-xs mt-1">{errors.ration_card_type}</p>
    )}
  </div>
</FormField>

              <FormField
                id="aadhaarNumber"
                label="Aadhaar Number"
                required
                hint="Used only as a unique identifier. The raw number is never displayed."
              >
               <div className="relative">
                 <input
                   id="aadhaarNumber"
                   type="text"
                   maxLength={12}
                   value={formData.aadhaarNumber}
                   onChange={(e) => {
                     const raw = e.target.value;

                     // Check for invalid characters before cleaning
                     if (/[^0-9]/.test(raw)) {
                       setErrors((prev) => ({
                         ...prev,
                         aadhaarNumber: "Only numbers allowed. No spaces or special characters."
                       }));
                     } else {
                       setErrors((prev) => ({ ...prev, aadhaarNumber: "" }));
                     }

                     const cleaned = raw.replace(/\D/g, "").slice(0, 12);
                     updateField("aadhaarNumber", cleaned);
                   }}
                   className={fieldClass(errors.aadhaarNumber, true)}
                 />
                 <VoiceInputButton onResult={(text) => updateField("aadhaarNumber", text)} />
               </div>

{errors.aadhaarNumber && (
  <p className="text-red-600 text-xs mt-1">{errors.aadhaarNumber}</p>
)}
              </FormField>
            </div>
          </section>
        )}

        {/* STEP 2: DOCUMENTS */}
        {step === 2 && (
          <section className="section-box">
            <h2 className="section-title mb-4">Documents</h2>

            <UploadCard
              id="electricityBill"
              label="Electricity Bill"
              hint="Latest bill used as a proxy for consumption and household stability. Accepted: PDF/JPG/PNG."
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                updateField("electricityBill", e.target.files?.[0] ?? null)
              }
            />
            <FormField
              id="electricity_units"
              label="Average Monthly Electricity Units Consumed"
              hint="Enter approximate units (kWh) based on your recent bills."
              required
            >
              <div className="relative">
                <input
                  id="electricity_units"
                  type="number"
                  min="0"
                  value={formData.electricity_units}
                  onChange={(e) =>
                    updateField("electricity_units", e.target.value)
                  }
                  className={fieldClass(false, true)}
                />
                <VoiceInputButton onResult={(text) => updateField("electricity_units", text)} />
              </div>
            </FormField>

            <UploadCard
              id="incomeCertificate"
              label="Income Certificate (optional)"
              hint="If available, upload to support income estimation."
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                updateField("incomeCertificate", e.target.files?.[0] ?? null)
              }
            />

            <UploadCard
              id="businessProof"
              label="Business Proof (if self-employed)"
              hint="E.g. shop license, UDYAM, GST certificate etc."
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                updateField("businessProof", e.target.files?.[0] ?? null)
              }
            />
          </section>
        )}

        {/* STEP 3: UTILITY & DIGITAL SIGNALS */}
        {step === 3 && (
          <section className="section-box">
            <h2 className="section-title mb-4">Utility & Digital Signals</h2>

            <FormField
              id="lpgInfo"
              label="LPG / Utility Usage Details"
              hint="Optional notes about LPG usage or other household utilities."
            >
              <textarea
                id="lpgInfo"
                rows="2"
                value={formData.lpgInfo}
                onChange={(e) => updateField("lpgInfo", e.target.value)}
                className={fieldClass(false)}
              />
            </FormField>

            <FormField
              id="digitalPaymentsInfo"
              label="Digital Payments / UPI Usage"
              hint="Optional notes about regular UPI or digital payment behaviour."
            >
              <textarea
                id="digitalPaymentsInfo"
                rows="2"
                value={formData.digitalPaymentsInfo}
                onChange={(e) =>
                  updateField("digitalPaymentsInfo", e.target.value)
                }
                className={fieldClass(false)}
              />
            </FormField>

            <div className="bg-govSoftBlue border border-blue-200 rounded-lg p-3 text-xs text-slate-700">
              In a full deployment, additional signals may be securely fetched
              via Account Aggregator and integrated into the scoring model.
            </div>
          </section>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {step === 4 && (
          <section className="section-box">
            <h2 className="section-title mb-4">Review & Submit</h2>

            <p className="text-sm text-slate-700 mb-4">
              Please review the key details below before submitting. In a full
              system, you would also see a pre-estimated score preview and
              consent summary here.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm mb-4">
              <div className="card p-4">
                <h3 className="font-semibold text-govBlue mb-3">
                  Personal Details
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {formData.applicantName}
                  </p>
                  <p>
                    <span className="font-medium">Age:</span> {formData.age}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {formData.gender || "-"}
                  </p>
                  <p>
                    <span className="font-medium">District:</span>{" "}
                    {formData.district}
                  </p>
                  <p>
                    <span className="font-medium">Household Size:</span>{" "}
                    {formData.household_size || "-"}
                  </p>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-govBlue mb-3">
                  Socio-economic
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Occupation Type:</span>{" "}
                    {formData.occupation_type || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Education Level:</span>{" "}
                    {formData.education_level || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Ration Card Type:</span>{" "}
                    {formData.ration_card_type || "-"}
                  </p>
                 <p>
                    <span className="font-medium">Aadhaar (masked):</span>{" "}
                    {formData.aadhaarNumber
                      ? `****-****-${formData.aadhaarNumber.slice(-4)}`
                      : "-"}
                  </p>

                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs md:text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-govBlue"
              />
              <span>
                <span className="font-semibold text-govInk block mb-1">
                  Account Aggregator Consent
                </span>
                <span className="leading-relaxed">
                  I confirm that the information provided above is accurate to the best of my
                  knowledge, and I explicitly authorize DHANSETU to fetch my financial data
                  (loan history, bank inflows, and utility consumption signals) via the Account
                  Aggregator framework for the sole purpose of assessing my loan eligibility.
                  {!consentGiven && (
                    <span className="text-red-600 font-medium"> This consent is required to submit your application.</span>
                  )}
                </span>
              </span>
            </label>
          </section>
        )}

        {/* NAV BUTTONS */}
        <div className="flex justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="subtle"
            disabled={step === 1}
            onClick={prevStep}
          >
            ← Previous
          </Button>

          {step < TOTAL_STEPS ? (
            <Button type="button" variant="primary" onClick={nextStep}>
              Next →
            </Button>
          ) : (
            <Button type="submit" variant="primary" disabled={!consentGiven}>
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
