import { useState, useEffect } from "react";
import { TrendingUp, Award, CheckCircle, Clock, AlertCircle, RefreshCw, DollarSign, Calendar } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function WageRetention() {
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wageInput, setWageInput] = useState("");
  const [wageStage, setWageStage] = useState("Periodic Appraisal");
  const [wageSaving, setWageSaving] = useState(false);

  // Retention Check-in State (C9)
  const [retentionAnswer, setRetentionAnswer] = useState(""); // 'yes' | 'no' | 'changed'
  const [attritionReason, setAttritionReason] = useState("Low salary");
  const [attritionComments, setAttritionComments] = useState("");

  // Changed Job fields
  const [newEmployer, setNewEmployer] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newWage, setNewWage] = useState("");
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split("T")[0]);

  const [retentionSaving, setRetentionSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
      if (res.trainee?.employment?.current_wage) {
        setWageInput(res.trainee.employment.current_wage.toString());
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

  // C8: Handle Wage Update
  const handleWageSubmit = async (e) => {
    e.preventDefault();
    if (!wageInput || Number(wageInput) <= 0) return;
    setWageSaving(true);
    try {
      await platformService.updateTraineeWage(traineeId, Number(wageInput), wageStage);
      setSuccessToast("Wage update recorded! Wage progression timeline updated.");
      setTimeout(() => setSuccessToast(""), 4000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error saving wage");
    } finally {
      setWageSaving(false);
    }
  };

  // C9 & C12: Handle Retention Check-in
  const handleRetentionSubmit = async (e) => {
    e.preventDefault();
    setRetentionSaving(true);
    try {
      if (retentionAnswer === "yes") {
        await platformService.retentionCheckIn(traineeId, true);
        setSuccessToast("Retention milestone confirmed! Thank you for validating your continued employment.");
      } else if (retentionAnswer === "no") {
        await platformService.retentionCheckIn(traineeId, false, {
          attrition_reason: attritionReason,
          comments: attritionComments
        });
        setSuccessToast("Employment transition and attrition reason recorded.");
      } else if (retentionAnswer === "changed") {
        await platformService.retentionCheckIn(traineeId, false, {
          changed_job: true,
          new_employer: newEmployer,
          new_role: newRole,
          new_wage: Number(newWage) || 25000,
          joining_date: newJoiningDate
        });
        setSuccessToast("New employer recorded! Verification request dispatched.");
      }
      setTimeout(() => setSuccessToast(""), 4000);
      setRetentionAnswer("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error submitting check-in");
    } finally {
      setRetentionSaving(false);
    }
  };

  const wageHistory = trainee?.wage_history || [];
  const emp = trainee?.employment;
  const employerName = emp?.employer_name || "your employer";

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <TrendingUp size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            LONGITUDINAL IMPACT TRACKING (C8, C9, C12)
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Wage Progression & Retention Check-in
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Track salary increments over time and confirm your active employment status for state retention benchmarking.
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails="No trainee record found."
      >
        {successToast && (
          <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={18} />
            <strong>{successToast}</strong>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* C8: WAGE UPDATE CARD */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <DollarSign size={20} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>Update Current Wage (C8)</h3>
              </div>
              <p style={{ margin: "0 0 1.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                Received an appraisal or promotion? Enter your updated gross monthly compensation.
              </p>

              <form onSubmit={handleWageSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Milestone / Event Type
                  </label>
                  <select
                    value={wageStage}
                    onChange={(e) => setWageStage(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="3-Month Appraisal">3-Month Performance Review</option>
                    <option value="6-Month Review">6-Month Review & Raise</option>
                    <option value="12-Month Annual Appraisal">12-Month Annual Increment</option>
                    <option value="Promotion / Role Elevation">Promotion / Role Elevation</option>
                    <option value="Periodic Wage Update">Periodic Wage Update</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    New Monthly Gross Wage (₹)
                  </label>
                  <input
                    type="number"
                    value={wageInput}
                    onChange={(e) => setWageInput(e.target.value)}
                    required
                    placeholder="e.g. 28000"
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", fontWeight: 700 }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={wageSaving}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem"
                  }}
                >
                  <TrendingUp size={16} />
                  {wageSaving ? "Recording..." : "Record Wage Increase"}
                </button>
              </form>
            </div>

            <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Active Base: <strong>₹{emp?.current_wage?.toLocaleString() || "Not Disclosed"}</strong>
              </span>
            </div>
          </div>

          {/* C9 & C12: RETENTION CHECK-IN CARD */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Clock size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>Periodic Retention Check-in (C9)</h3>
            </div>
            <p style={{ margin: "0 0 1.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
              Periodic verification ensuring government outcome integrity.
            </p>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", display: "block" }}>
                "Are you still working at {employerName}?"
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {[
                { key: "yes", label: "Yes, Still Working" },
                { key: "no", label: "No, Left Employment" },
                { key: "changed", label: "Changed Job" }
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setRetentionAnswer(opt.key)}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.5rem",
                    borderRadius: "6px",
                    border: retentionAnswer === opt.key ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    background: retentionAnswer === opt.key ? "#eff6ff" : "white",
                    color: retentionAnswer === opt.key ? "#1d4ed8" : "#475569",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* If YES */}
            {retentionAnswer === "yes" && (
              <form onSubmit={handleRetentionSubmit}>
                <p style={{ fontSize: "0.85rem", color: "#166534", background: "#dcfce7", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem" }}>
                  Great! Clicking confirm will update your active retention record for the ongoing 6M/12M milestone.
                </p>
                <button
                  type="submit"
                  disabled={retentionSaving}
                  style={{ width: "100%", padding: "0.75rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                >
                  {retentionSaving ? "Confirming..." : "Confirm Active Employment"}
                </button>
              </form>
            )}

            {/* If NO: C12 Attrition Form */}
            {retentionAnswer === "no" && (
              <form onSubmit={handleRetentionSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Primary Reason for Leaving (C12 Attrition)
                  </label>
                  <select
                    value={attritionReason}
                    onChange={(e) => setAttritionReason(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Low salary">Low salary / Insufficient compensation</option>
                    <option value="Better opportunity">Found better opportunity elsewhere</option>
                    <option value="Skill mismatch">Skill mismatch with daily responsibilities</option>
                    <option value="Poor working conditions">Poor working conditions</option>
                    <option value="Relocation">Relocation / Distance & transport issues</option>
                    <option value="Contract ended">Contract / Temporary tenure ended</option>
                    <option value="Personal reasons">Personal or family commitments</option>
                    <option value="Other">Other reasons</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <textarea
                    value={attritionComments}
                    onChange={(e) => setAttritionComments(e.target.value)}
                    rows={2}
                    placeholder="Provide additional context if comfortable..."
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={retentionSaving}
                  style={{ width: "100%", padding: "0.75rem", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                >
                  {retentionSaving ? "Recording..." : "Record Exit Status"}
                </button>
              </form>
            )}

            {/* If CHANGED JOB */}
            {retentionAnswer === "changed" && (
              <form onSubmit={handleRetentionSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    value={newEmployer}
                    onChange={(e) => setNewEmployer(e.target.value)}
                    required
                    placeholder="New Employer Name"
                    style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    placeholder="New Job Role"
                    style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                  <input
                    type="number"
                    value={newWage}
                    onChange={(e) => setNewWage(e.target.value)}
                    placeholder="New Monthly Wage (₹)"
                    style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                  <input
                    type="date"
                    value={newJoiningDate}
                    onChange={(e) => setNewJoiningDate(e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={retentionSaving}
                  style={{ width: "100%", padding: "0.75rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                >
                  {retentionSaving ? "Submitting..." : "Save New Employment"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* WAGE PROGRESSION TIMELINE (C8) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.15rem", color: "#0f172a" }}>
            Your Wage Growth Trajectory (Authoritative Timeline)
          </h3>

          {wageHistory.length > 0 ? (
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {wageHistory.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: "1 1 200px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "1.25rem"
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                    {item.stage}
                  </span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0.25rem 0" }}>
                    ₹{item.amount?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={13} /> {item.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No wage milestones logged yet.</p>
          )}
        </div>
      </DataStateWrapper>
    </div>
  );
}
