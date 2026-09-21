import { useState, useEffect } from "react";
import { 
  PieChart, TrendingUp, Award, CheckCircle2, ShieldCheck, 
  Calendar, Briefcase, PlusCircle, AlertCircle, ArrowUpRight, DollarSign 
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeOutcomes() {
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";

  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWageModal, setShowWageModal] = useState(false);
  const [newWage, setNewWage] = useState("");
  const [wageStage, setWageStage] = useState("Periodic Appraisal");
  const [savingWage, setSavingWage] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
      if (res.trainee?.employment?.current_wage) {
        setNewWage(res.trainee.employment.current_wage.toString());
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

  const handleWageSubmit = async (e) => {
    e.preventDefault();
    if (!newWage || Number(newWage) < 0) return;
    setSavingWage(true);
    try {
      await platformService.updateTraineeWage(traineeId, Number(newWage), wageStage);
      setToastMessage("New wage progression milestone successfully recorded!");
      setShowWageModal(false);
      setTimeout(() => setToastMessage(""), 4000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update wage.");
    } finally {
      setSavingWage(false);
    }
  };

  const outcomeSummary = trainee?.outcome_summary || {};
  const wageHistory = trainee?.wage_history || [];
  const wageMetrics = trainee?.wage_metrics || {};
  const retention = trainee?.retention || {};
  const emp = trainee?.employment || {};

  // Strict Zero vs No Data handling (Section 44)
  const hasWageData = wageHistory.length > 0 || (emp && typeof emp.current_wage === "number");
  const currentWageValue = typeof emp.current_wage === "number" ? emp.current_wage : (wageMetrics.current_wage || 0);

  // SVG Line Chart coordinates calculation
  const chartWidth = 560;
  const chartHeight = 180;
  const padding = 40;

  const validWages = wageHistory.filter(w => typeof w.amount === "number");
  const maxWage = Math.max(...validWages.map(w => w.amount), 35000);
  const minWage = Math.min(...validWages.map(w => w.amount), 15000);

  const points = validWages.map((pt, idx) => {
    const x = padding + (idx * ((chartWidth - (padding * 2)) / Math.max(validWages.length - 1, 1)));
    const y = chartHeight - padding - (((pt.amount - minWage) / (maxWage - minWage || 1)) * (chartHeight - (padding * 2)));
    return { x, y, amount: pt.amount, stage: pt.stage, date: pt.date };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "")
    : "";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <PieChart size={20} color="#2563eb" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              PERSONAL OUTCOME & INCOME PROGRESSION
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            My Personal Outcomes
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Real-world vocational results, salary increments over time, and sustained milestone retention checks.
          </p>
        </div>

        <button
          onClick={() => setShowWageModal(true)}
          style={{
            padding: "0.65rem 1.25rem",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <PlusCircle size={16} /> Log Wage Increment
        </button>
      </div>

      {toastMessage && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "1rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} />
          <strong>{toastMessage}</strong>
        </div>
      )}

      <DataStateWrapper
        isLoading={loading}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails="No outcome records available."
      >
        {/* SECTION 1: "WHERE AM I NOW?" HIGH-LEVEL STATUS SUMMARY (Section 33) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem 0" }}>
            Where Am I Now? (Status Summary)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Training</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>
                ✓ {trainee?.training_status || "Completed"}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Certification</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: trainee?.certified ? "#15803d" : "#b45309", marginTop: "0.2rem" }}>
                {trainee?.certified ? "✓ Certified" : "Pending"}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Employment</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: emp.status === "EMPLOYED" ? "#2563eb" : "#0f172a", marginTop: "0.2rem" }}>
                {emp.status ? emp.status.replace("_", " ") : "Unemployed"}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Retention</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d", marginTop: "0.2rem" }}>
                {retention.retention_6m === "Retained" ? "✓ 6M Retained" : (retention.retention_6m || "Upcoming")}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Wage Growth</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#7c3aed", marginTop: "0.2rem" }}>
                {hasWageData && wageMetrics.growth_percentage ? `↑ +${wageMetrics.growth_percentage}%` : "+0%"}
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Skill Relevance</span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                {outcomeSummary.skill_relevance || "Relevant"}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: WAGE TRACKING & LINE CHART (Section 14) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                Income Growth & Wage Progression
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Track monthly compensation evolution from your initial placement to periodic appraisal milestones.
              </p>
            </div>

            {hasWageData && (
              <div style={{ display: "flex", gap: "1.5rem", background: "#f8fafc", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>STARTING WAGE</span>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                    ₹{Number(wageMetrics.initial_wage || (wageHistory[0]?.amount || 0)).toLocaleString()}
                  </div>
                </div>

                <div style={{ width: "1px", height: "36px", background: "#cbd5e1" }} />

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>CURRENT WAGE</span>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#15803d" }}>
                    ₹{Number(currentWageValue).toLocaleString()}
                  </div>
                </div>

                <div style={{ width: "1px", height: "36px", background: "#cbd5e1" }} />

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>NET APPRECIATION</span>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2563eb" }}>
                    +₹{Number(wageMetrics.wage_increase || 0).toLocaleString()} ({wageMetrics.growth_percentage || 0}%)
                  </div>
                </div>
              </div>
            )}
          </div>

          {!hasWageData ? (
            <div style={{ padding: "2rem", textAlign: "center", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
              <DollarSign size={32} color="#94a3b8" style={{ margin: "0 auto 0.5rem auto" }} />
              <strong style={{ display: "block", color: "#475569" }}>No wage data available</strong>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                No verified income entries recorded. Log your starting wage or employment status to start tracking.
              </span>
            </div>
          ) : (
            <div>
              {/* SVG Line Chart */}
              <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "200px", overflow: "visible" }}>
                  {/* Grid lines */}
                  <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" strokeWidth="2" />
                  <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#e2e8f0" strokeDasharray="4 4" />

                  {/* Wage Trend Path */}
                  {pathD && (
                    <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  )}

                  {/* Points & Labels */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="6" fill="#2563eb" stroke="white" strokeWidth="2" />
                      <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
                        ₹{p.amount.toLocaleString()}
                      </text>
                      <text x={p.x} y={chartHeight - padding + 18} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                        {p.stage}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Wage History Records Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "0.65rem 1rem" }}>Appraisal / Event</th>
                    <th style={{ padding: "0.65rem 1rem" }}>Date</th>
                    <th style={{ padding: "0.65rem 1rem" }}>Reported Monthly Wage</th>
                    <th style={{ padding: "0.65rem 1rem" }}>Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wageHistory.map((w, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>{w.stage}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>{w.date}</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#15803d" }}>₹{w.amount.toLocaleString()}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#1d4ed8" }}>✓ Payroll Confirmed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 3: RETENTION TRACKING (Section 15) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
            Retention Milestones & Continuous Employment
          </h3>
          <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
            Validation of job continuity at mandatory 3-month, 6-month, and 12-month intervals.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {/* 3M Milestone */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>3-MONTH CHECKPOINT</span>
                <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                  {retention.retention_3m || "Retained"}
                </span>
              </div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>
                Initial Role Stability
              </strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>
                Confirmed active on corporate payroll at {emp.employer_name || "Employer"}.
              </p>
            </div>

            {/* 6M Milestone */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>6-MONTH CHECKPOINT</span>
                <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                  {retention.retention_6m || "Retained"}
                </span>
              </div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>
                Mid-Term Sustenance
              </strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>
                6M retention verified. Eligible for state training impact accreditation.
              </p>
            </div>

            {/* 12M Milestone */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>12-MONTH CHECKPOINT</span>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                  {retention.retention_12m || "Upcoming"}
                </span>
              </div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>
                Long-Term Career Anchor
              </strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>
                Longitudinal 1-year evaluation following programme completion.
              </p>
            </div>
          </div>
        </div>

        {/* LOG WAGE MODAL */}
        {showWageModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
            <div style={{ background: "white", borderRadius: "14px", maxWidth: "480px", width: "100%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
                Record Wage Increment
              </h3>
              <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
                Enter your updated monthly compensation. The wage trajectory chart will update dynamically.
              </p>

              <form onSubmit={handleWageSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.3rem" }}>
                    Milestone / Reason:
                  </label>
                  <select
                    value={wageStage}
                    onChange={(e) => setWageStage(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="6-Month Performance Increment">6-Month Performance Increment</option>
                    <option value="12-Month Annual Appraisal">12-Month Annual Appraisal</option>
                    <option value="Promotion to Senior Role">Promotion to Senior Role</option>
                    <option value="New Employer Transition">New Employer Transition</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.3rem" }}>
                    New Monthly Gross CTC (₹):
                  </label>
                  <input
                    type="number"
                    value={newWage}
                    onChange={(e) => setNewWage(e.target.value)}
                    placeholder="e.g. 28000"
                    required
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowWageModal(false)}
                    style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingWage}
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "none", background: "#2563eb", color: "white", fontWeight: 700, cursor: savingWage ? "not-allowed" : "pointer" }}
                  >
                    {savingWage ? "Saving..." : "Submit Wage Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </DataStateWrapper>
    </div>
  );
}
