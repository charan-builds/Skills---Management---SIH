import { useState, useEffect } from "react";
import { Briefcase, Building2, Calendar, MapPin, CheckCircle, Clock, Send, AlertTriangle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeEmployment() {
  const { t } = useLanguage();
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Status Selector (C4)
  const [status, setStatus] = useState("EMPLOYED"); // 'EMPLOYED' | 'SELF_EMPLOYED' | 'APPRENTICESHIP' | 'UNEMPLOYED' | 'STUDYING_FURTHER'

  // Employed Fields (C5)
  const [employerName, setEmployerName] = useState("Tata Consultancy Services");
  const [jobRole, setJobRole] = useState("Associate Cloud Engineer");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [workLocation, setWorkLocation] = useState("Mumbai");
  const [salary, setSalary] = useState("24000");

  // Self-Employed Fields (C6)
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Freelance IT / Tech Consultancy");
  const [monthlyIncome, setMonthlyIncome] = useState("28000");
  const [selfStartDate, setSelfStartDate] = useState(new Date().toISOString().split("T")[0]);

  // Apprenticeship Fields (C7)
  const [apprenticeOrg, setApprenticeOrg] = useState("Reliance Clean Energy Ltd");
  const [apprenticeRole, setApprenticeRole] = useState("Apprentice Technician");
  const [apprenticeStart, setApprenticeStart] = useState(new Date().toISOString().split("T")[0]);
  const [stipend, setStipend] = useState("16000");

  // Common Status Reason / Context Field (All Statuses)
  const [statusReason, setStatusReason] = useState("");

  // Unemployed Fields (C11)
  const [unemploymentReason, setUnemploymentReason] = useState("Lack of required skills");
  const [unemploymentComments, setUnemploymentComments] = useState("");

  // Studying Further Fields
  const [institutionName, setInstitutionName] = useState("");
  const [courseName, setCourseName] = useState("");

  const getStatusReasonConfig = (currentStatus) => {
    switch (currentStatus) {
      case "EMPLOYED":
        return {
          label: t("trainee_employment.reason_employed_label", "Reason / Context for Employment Status"),
          description: t("trainee_employment.reason_employed_desc", "Explain how you secured this role, relevant skills used, or any notes on your placement."),
          placeholder: t("trainee_employment.reason_employed_ph", "e.g. Secured full-time employment through campus placement drive based on cloud infrastructure skills.")
        };
      case "SELF_EMPLOYED":
        return {
          label: t("trainee_employment.reason_self_employed_label", "Reason / Context for Self-Employment Venture"),
          description: t("trainee_employment.reason_self_employed_desc", "Explain your venture rationale, freelance client base, or motivation for self-employment."),
          placeholder: t("trainee_employment.reason_self_employed_ph", "e.g. Established independent tech consultancy focusing on web development for local businesses.")
        };
      case "APPRENTICESHIP":
        return {
          label: t("trainee_employment.reason_apprentice_label", "Reason / Context for Apprenticeship"),
          description: t("trainee_employment.reason_apprentice_desc", "Explain your learning objectives or transition path to full-time employment."),
          placeholder: t("trainee_employment.reason_apprentice_ph", "e.g. Selected apprenticeship to gain practical industrial plant experience in renewable energy.")
        };
      case "UNEMPLOYED":
        return {
          label: t("trainee_employment.reason_unemployed_label", "Reason / Context for Seeking Job"),
          description: t("trainee_employment.reason_unemployed_desc", "Explain the reason or provide personal context for your current job search (e.g. skill gaps, interview experiences)."),
          placeholder: t("trainee_employment.reason_unemployed_ph", "e.g. I am currently looking for a job because I lack experience with the technical skills required in recent interviews.")
        };
      case "STUDYING_FURTHER":
        return {
          label: t("trainee_employment.reason_studying_label", "Reason / Context for Further Education"),
          description: t("trainee_employment.reason_studying_desc", "Explain why you chose to pursue advanced education and future career plans."),
          placeholder: t("trainee_employment.reason_studying_ph", "e.g. Enrolled in higher technical diploma to qualify for specialized engineering roles.")
        };
      default:
        return {
          label: t("trainee_employment.reason_default_label", "Reason / Comments on Current Status"),
          description: t("trainee_employment.reason_default_desc", "Provide additional context or explanation regarding your current status."),
          placeholder: t("trainee_employment.reason_default_ph", "Describe the reason or context for your current employment status...")
        };
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      if (res.trainee) {
        setTrainee(res.trainee);
        const emp = res.trainee.employment;
        if (emp?.status) {
          setStatus(emp.status);
          const savedReason = emp.status_reason || emp.comments || emp.unemployment_reason || "";
          setStatusReason(savedReason);
          if (emp.status === "EMPLOYED") {
            setEmployerName(emp.employer_name || "");
            setJobRole(emp.job_role || "");
            setJoiningDate(emp.joining_date || "");
            setWorkLocation(emp.work_location || "");
            setSalary(emp.starting_wage?.toString() || "");
          } else if (emp.status === "SELF_EMPLOYED") {
            setBusinessName(emp.business_name || "");
            setBusinessType(emp.business_type || "");
            setMonthlyIncome(emp.monthly_income?.toString() || "");
            setSelfStartDate(emp.start_date || "");
          } else if (emp.status === "APPRENTICESHIP") {
            setApprenticeOrg(emp.employer_name || "");
            setApprenticeRole(emp.job_role || "");
            setApprenticeStart(emp.joining_date || "");
            setStipend(emp.stipend?.toString() || "");
          } else if (emp.status === "UNEMPLOYED") {
            setUnemploymentReason(emp.unemployment_reason || "Lack of required skills");
            setUnemploymentComments(emp.comments || savedReason || "");
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [traineeId, store.last_updated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    try {
      let payload = { status, status_reason: statusReason, comments: statusReason };
      if (status === "EMPLOYED") {
        payload = {
          ...payload,
          employer_name: employerName,
          job_role: jobRole,
          joining_date: joiningDate,
          work_location: workLocation,
          starting_wage: Number(salary) || 22000,
          status_reason: statusReason,
          comments: statusReason
        };
      } else if (status === "SELF_EMPLOYED") {
        payload = {
          ...payload,
          business_name: businessName,
          business_type: businessType,
          monthly_income: Number(monthlyIncome) || 20000,
          start_date: selfStartDate,
          work_location: workLocation,
          status_reason: statusReason,
          comments: statusReason
        };
      } else if (status === "APPRENTICESHIP") {
        payload = {
          ...payload,
          employer_name: apprenticeOrg,
          job_role: apprenticeRole,
          joining_date: apprenticeStart,
          stipend: Number(stipend) || 15000,
          starting_wage: Number(stipend) || 15000,
          status_reason: statusReason,
          comments: statusReason
        };
      } else if (status === "UNEMPLOYED") {
        payload = {
          ...payload,
          unemployment_reason: unemploymentReason,
          status_reason: statusReason || unemploymentComments,
          comments: statusReason || unemploymentComments
        };
      } else if (status === "STUDYING_FURTHER") {
        payload = {
          ...payload,
          institution_name: institutionName,
          course_name: courseName,
          status_reason: statusReason,
          comments: statusReason
        };
      }

      await platformService.reportTraineeEmployment(traineeId, payload);
      setSuccessMessage("Employment record successfully submitted and sent to employer/admin queues!");
      setTimeout(() => setSuccessMessage(""), 5000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to submit employment status.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentEmp = trainee?.employment;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Briefcase size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("trainee_employment.badge", "EMPLOYMENT & OUTCOME REPORTING")}
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {t("trainee_employment.title", "Employment Status Declaration")}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {t("trainee_employment.subtitle", "Declare your placement, self-employment venture, or apprenticeship. Submissions trigger automated employer verification.")}
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails={t("trainee_employment.empty_profile", "No trainee profile found.")}
      >
        {/* Current Active Status Card */}
        {currentEmp && (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{t("trainee_employment.active_declared_status", "Active Declared Status:")}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <strong style={{ fontSize: "1.2rem", color: "#0f172a" }}>
                  {t(currentEmp.status, currentEmp.status.replace("_", " "))}
                </strong>
                {currentEmp.employer_name && (
                  <span style={{ color: "#475569" }}>{t("trainee_employment.at_prefix", "at")} {currentEmp.employer_name}</span>
                )}
              </div>
              {(currentEmp.status_reason || currentEmp.comments || currentEmp.unemployment_reason) && (
                <div style={{ marginTop: "0.4rem", fontSize: "0.85rem", color: "#475569", background: "#f8fafc", padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontWeight: 600, color: "#334155" }}>{t("trainee_employment.recorded_context", "Recorded Context / Reason:")} </span>
                  <span style={{ fontStyle: "italic" }}>"{t(currentEmp.status_reason || currentEmp.comments || currentEmp.unemployment_reason, currentEmp.status_reason || currentEmp.comments || currentEmp.unemployment_reason)}"</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{t("trainee_employment.verification_state", "Verification State:")}</span>
              <span
                style={{
                  background: currentEmp.verification_status === "Verified" ? "#dcfce7" : currentEmp.verification_status === "Correction Requested" ? "#fef3c7" : currentEmp.verification_status === "Rejected" ? "#fee2e2" : "#eff6ff",
                  color: currentEmp.verification_status === "Verified" ? "#15803d" : currentEmp.verification_status === "Correction Requested" ? "#b45309" : currentEmp.verification_status === "Rejected" ? "#b91c1c" : "#1d4ed8",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 700
                }}
              >
                {t(currentEmp.verification_status || "Pending", currentEmp.verification_status || "Pending")}
              </span>
            </div>
          </div>
        )}

        {/* Correction Requested Notice (Section 27) */}
        {currentEmp?.verification_status === "Correction Requested" && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <AlertTriangle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <strong style={{ color: "#92400e", fontSize: "0.95rem", display: "block", marginBottom: "0.25rem" }}>
                {t("trainee_employment.correction_requested_title", "Employer Requested Information Correction")}
              </strong>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#78350f" }}>
                {t("trainee_employment.correction_requested_desc", "The employer review desk at {name} reviewed your claim and requested the following adjustment:").replace("{name}", currentEmp.employer_name)}
              </p>
              <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid #fcd34d", fontStyle: "italic", fontSize: "0.85rem", color: "#b45309", marginBottom: "0.5rem" }}>
                "{currentEmp.employer_remarks || "Please verify your official job title or joining date."}"
              </div>
              <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }}>
                {t("trainee_employment.correction_requested_instruction", "Please adjust the details in the form below and click \"Submit Employment Record\" to dispatch the corrected claim back to the employer.")}
              </span>
            </div>
          </div>
        )}

        {successMessage && (
          <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "0.9rem 1.25rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={18} />
            <strong>{successMessage}</strong>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem" }}>
          {/* C4 Status Tabs */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
              {t("trainee_employment.select_outcome_status", "Select Your Current Outcome Status")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {[
                { key: "EMPLOYED", label: t("trainee_employment.status_employed", "Employed") },
                { key: "SELF_EMPLOYED", label: t("trainee_employment.status_self_employed", "Self-Employed") },
                { key: "APPRENTICESHIP", label: t("trainee_employment.status_apprentice", "Apprentice") },
                { key: "UNEMPLOYED", label: t("trainee_employment.status_seeking_job", "Seeking Job") },
                { key: "STUDYING_FURTHER", label: t("trainee_employment.status_studying_further", "Studying Further") }
              ].map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => setStatus(s.key)}
                  style={{
                    padding: "0.8rem",
                    borderRadius: "8px",
                    border: status === s.key ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    background: status === s.key ? "#eff6ff" : "white",
                    color: status === s.key ? "#1d4ed8" : "#475569",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Reason / Context Field for Selected Outcome Status */}
          <div style={{ marginBottom: "2rem", background: "#f8fafc", padding: "1.25rem 1.5rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                {getStatusReasonConfig(status).label}
              </label>
              <span style={{ fontSize: "0.75rem", color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "12px", border: "1px solid #bfdbfe", fontWeight: 600 }}>
                {status === "UNEMPLOYED" ? t("trainee_employment.key_context_placement", "Key context for placement cell") : t("trainee_employment.self_reported_explanation", "Self-reported explanation")}
              </span>
            </div>
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", color: "#64748b" }}>
              {getStatusReasonConfig(status).description}
            </p>
            <textarea
              value={statusReason}
              onChange={(e) => {
                setStatusReason(e.target.value);
                if (status === "UNEMPLOYED") {
                  setUnemploymentComments(e.target.value);
                }
              }}
              rows={3}
              placeholder={getStatusReasonConfig(status).placeholder}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                background: "white",
                boxSizing: "border-box",
                lineHeight: "1.4"
              }}
            />
          </div>

          {/* C5 EMPLOYED FORM */}
          {status === "EMPLOYED" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("trainee_employment.employer_org_label", "Employer Organization Name")}
                  </label>
                  <input
                    type="text"
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    required
                    placeholder="e.g. Tata Consultancy Services"
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("trainee_employment.job_role_title_label", "Job Role / Title")}
                  </label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                    placeholder="e.g. Junior Cloud Associate"
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("trainee_employment.official_joining_date", "Official Joining Date")}
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("trainee_employment.monthly_starting_wage", "Monthly Starting Gross Wage (₹)")}
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 24000"
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.work_location_city", "Work Location / City")}
                </label>
                <input
                  type="text"
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Andheri MIDC"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          )}

          {/* C6 SELF-EMPLOYED FORM */}
          {status === "SELF_EMPLOYED" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.business_name_label", "Business / Micro-Enterprise Name")}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="e.g. CloudForge Solutions"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.business_type_label", "Business Type / Domain")}
                </label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. IT Consulting / Computer Hardware Repair"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.commencement_date", "Commencement Date")}
                </label>
                <input
                  type="date"
                  value={selfStartDate}
                  onChange={(e) => setSelfStartDate(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.estimated_monthly_earnings", "Estimated Monthly Earnings (₹)")}
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 28000"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          )}

          {/* C7 APPRENTICESHIP FORM */}
          {status === "APPRENTICESHIP" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.host_org_label", "Host Organization / Industry")}
                </label>
                <input
                  type="text"
                  value={apprenticeOrg}
                  onChange={(e) => setApprenticeOrg(e.target.value)}
                  required
                  placeholder="e.g. Reliance Clean Energy Ltd"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.apprenticeship_role_label", "Apprenticeship Role")}
                </label>
                <input
                  type="text"
                  value={apprenticeRole}
                  onChange={(e) => setApprenticeRole(e.target.value)}
                  required
                  placeholder="e.g. Graduate Solar Apprentice"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.contract_start_date", "Contract Start Date")}
                </label>
                <input
                  type="date"
                  value={apprenticeStart}
                  onChange={(e) => setApprenticeStart(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.monthly_stipend_label", "Monthly Stipend (₹)")}
                </label>
                <input
                  type="number"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. 16000"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          )}

          {/* C11 UNEMPLOYED FORM */}
          {status === "UNEMPLOYED" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.primary_nonplacement_reason", "Primary Non-Placement Reason")}
                </label>
                <select
                  value={unemploymentReason}
                  onChange={(e) => setUnemploymentReason(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                >
                  <option value="Lack of required skills">{t("trainee_employment.opt_lack_skills", "Lack of required skills (technical gaps in hiring interviews)")}</option>
                  <option value="No suitable jobs">{t("trainee_employment.opt_no_jobs", "No suitable jobs matching profile in district")}</option>
                  <option value="Location issues">{t("trainee_employment.opt_location", "Location / Relocation constraints")}</option>
                  <option value="Salary too low">{t("trainee_employment.opt_salary_low", "Offered compensation was below threshold")}</option>
                  <option value="Lack of experience">{t("trainee_employment.opt_lack_experience", "Employers demanded prior experience")}</option>
                  <option value="Further education">{t("trainee_employment.opt_further_education", "Preparing for higher education")}</option>
                  <option value="Other">{t("trainee_employment.opt_other", "Other personal/family reasons")}</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.comments_support_requested", "Comments / Support Requested from Placement Cell")}
                </label>
                <textarea
                  value={unemploymentComments || statusReason}
                  onChange={(e) => {
                    setUnemploymentComments(e.target.value);
                    setStatusReason(e.target.value);
                  }}
                  rows={3}
                  placeholder={t("trainee_employment.unemployed_comments_placeholder", "Describe your current job search and if you require refocused competency training.")}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          )}

          {/* STUDYING FURTHER FORM */}
          {status === "STUDYING_FURTHER" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.college_university_label", "College / University / Higher Institute")}
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Government Polytechnic"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("trainee_employment.programme_study_label", "Programme of Study")}
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Diploma in Computer Engineering"
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.8rem 2.25rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Send size={18} />
              {submitting ? t("trainee_employment.btn_submitting_declaration", "Submitting Declaration...") : t("trainee_employment.btn_submit_employment", "Submit Employment Status")}
            </button>
          </div>
        </form>
      </DataStateWrapper>
    </div>
  );
}
