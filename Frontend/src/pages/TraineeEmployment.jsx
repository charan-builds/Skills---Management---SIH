import { useState, useEffect } from "react";
import { Briefcase, Building2, Calendar, MapPin, CheckCircle, Clock, Send, AlertTriangle } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeEmployment() {
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

  // Unemployed Fields (C11)
  const [unemploymentReason, setUnemploymentReason] = useState("Lack of required skills");
  const [unemploymentComments, setUnemploymentComments] = useState("");

  // Studying Further Fields
  const [institutionName, setInstitutionName] = useState("");
  const [courseName, setCourseName] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      if (res.trainee) {
        setTrainee(res.trainee);
        const emp = res.trainee.employment;
        if (emp?.status) {
          setStatus(emp.status);
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
            setUnemploymentComments(emp.comments || "");
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
      let payload = { status };
      if (status === "EMPLOYED") {
        payload = {
          ...payload,
          employer_name: employerName,
          job_role: jobRole,
          joining_date: joiningDate,
          work_location: workLocation,
          starting_wage: Number(salary) || 22000
        };
      } else if (status === "SELF_EMPLOYED") {
        payload = {
          ...payload,
          business_name: businessName,
          business_type: businessType,
          monthly_income: Number(monthlyIncome) || 20000,
          start_date: selfStartDate,
          work_location: workLocation
        };
      } else if (status === "APPRENTICESHIP") {
        payload = {
          ...payload,
          employer_name: apprenticeOrg,
          job_role: apprenticeRole,
          joining_date: apprenticeStart,
          stipend: Number(stipend) || 15000,
          starting_wage: Number(stipend) || 15000
        };
      } else if (status === "UNEMPLOYED") {
        payload = {
          ...payload,
          unemployment_reason: unemploymentReason,
          comments: unemploymentComments
        };
      } else if (status === "STUDYING_FURTHER") {
        payload = {
          ...payload,
          institution_name: institutionName,
          course_name: courseName
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
            EMPLOYMENT & OUTCOME REPORTING (C4-C7)
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Employment Status Declaration
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Declare your placement, self-employment venture, or apprenticeship. Submissions trigger automated employer verification.
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails="No trainee profile found."
      >
        {/* Current Active Status Card */}
        {currentEmp && (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Active Declared Status:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                <strong style={{ fontSize: "1.2rem", color: "#0f172a" }}>
                  {currentEmp.status.replace("_", " ")}
                </strong>
                {currentEmp.employer_name && (
                  <span style={{ color: "#475569" }}>at {currentEmp.employer_name}</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Verification State:</span>
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
                {currentEmp.verification_status || "Pending"}
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
                Employer Requested Information Correction
              </strong>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#78350f" }}>
                The employer review desk at <strong>{currentEmp.employer_name}</strong> reviewed your claim and requested the following adjustment:
              </p>
              <div style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid #fcd34d", fontStyle: "italic", fontSize: "0.85rem", color: "#b45309", marginBottom: "0.5rem" }}>
                "{currentEmp.employer_remarks || "Please verify your official job title or joining date."}"
              </div>
              <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }}>
                Please adjust the details in the form below and click "Submit Employment Record" to dispatch the corrected claim back to the employer.
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
              Select Your Current Outcome Status (C4)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {[
                { key: "EMPLOYED", label: "Employed" },
                { key: "SELF_EMPLOYED", label: "Self-Employed" },
                { key: "APPRENTICESHIP", label: "Apprentice" },
                { key: "UNEMPLOYED", label: "Seeking Job" },
                { key: "STUDYING_FURTHER", label: "Studying Further" }
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

          {/* C5 EMPLOYED FORM */}
          {status === "EMPLOYED" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Employer Organization Name
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
                    Job Role / Title
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
                    Official Joining Date
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
                    Monthly Starting Gross Wage (₹)
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
                  Work Location / City
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
                  Business / Micro-Enterprise Name
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
                  Business Type / Domain
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
                  Commencement Date
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
                  Estimated Monthly Earnings (₹)
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
                  Host Organization / Industry
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
                  Apprenticeship Role
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
                  Contract Start Date
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
                  Monthly Stipend (₹)
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
                  Primary Non-Placement Reason (C11)
                </label>
                <select
                  value={unemploymentReason}
                  onChange={(e) => setUnemploymentReason(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                >
                  <option value="Lack of required skills">Lack of required skills (technical gaps in hiring interviews)</option>
                  <option value="No suitable jobs">No suitable jobs matching profile in district</option>
                  <option value="Location issues">Location / Relocation constraints</option>
                  <option value="Salary too low">Offered compensation was below threshold</option>
                  <option value="Lack of experience">Employers demanded prior experience</option>
                  <option value="Further education">Preparing for higher education</option>
                  <option value="Other">Other personal/family reasons</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Comments / Support Requested from Placement Cell
                </label>
                <textarea
                  value={unemploymentComments}
                  onChange={(e) => setUnemploymentComments(e.target.value)}
                  rows={3}
                  placeholder="Describe your current job search and if you require refocused competency training."
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
                  College / University / Higher Institute
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
                  Programme of Study
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
              {submitting ? "Submitting Declaration..." : "Submit Employment Status"}
            </button>
          </div>
        </form>
      </DataStateWrapper>
    </div>
  );
}
