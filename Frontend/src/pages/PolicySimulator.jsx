import { useState, useEffect } from "react";
import {
  Sliders, Play, RotateCcw, Save, Trash2, Copy, Eye, AlertCircle,
  Sparkles, TrendingUp, Users, DollarSign, Award, CheckCircle2,
  HelpCircle, ChevronRight, Layers, FileText, ArrowUpRight, BarChart3, Info
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { useFilters } from "../context/FilterContext";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const INTERVENTION_OPTIONS = [
  { id: "Add Training Module", label: "1. Add Training Module" },
  { id: "Increase Training Hours", label: "2. Increase Training Hours" },
  { id: "Industry Certification", label: "3. Industry Certification" },
  { id: "Apprenticeship Program", label: "4. Apprenticeship Program" },
  { id: "Employer Mentorship", label: "5. Employer Mentorship" },
  { id: "Placement Assistance", label: "6. Placement Assistance" },
  { id: "Soft Skills Training", label: "7. Soft Skills Training" },
  { id: "Trainer Capacity Increase", label: "8. Trainer Capacity Increase" },
  { id: "Employer Partnership Expansion", label: "9. Employer Partnership Expansion" },
  { id: "Post-Training Follow-up", label: "10. Post-Training Follow-up" },
  { id: "Transportation Support", label: "11. Transportation Support" },
  { id: "Custom Intervention", label: "12. Custom Intervention" }
];

export default function PolicySimulator() {
  const { filters } = useFilters();
  const store = usePlatformStore();

  const [baseline, setBaseline] = useState(null);
  const [loadingBaseline, setLoadingBaseline] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [comparisonList, setComparisonList] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Scenario Builder Form State (Pre-filled with default Demo Scenario)
  const [form, setForm] = useState({
    scenario_name: "PLC Expansion – September 2026",
    intervention_type: "Add Training Module",
    module_name: "PLC & Industrial Automation",
    additional_hours: 20,
    affected_trainees: 4200,
    cost_per_trainee: 2500,
    relevance_level: "High",
    duration_months: 3,
    employer_count: 15
  });

  // Load Baseline and Saved Scenarios
  const loadInitialData = async () => {
    setLoadingBaseline(true);
    try {
      const base = await platformService.getPolicySimulatorBaseline(filters);
      setBaseline(base);
      // Run initial demo simulation automatically
      const demoRes = await platformService.runPolicySimulation({
        scenario_name: form.scenario_name,
        intervention_type: form.intervention_type,
        parameters: {
          module_name: form.module_name,
          additional_hours: form.additional_hours,
          affected_trainees: form.affected_trainees,
          cost_per_trainee: form.cost_per_trainee,
          relevance_level: form.relevance_level,
          duration_months: form.duration_months,
          employer_count: form.employer_count
        }
      }, filters);

      setSimulationResult(demoRes);
      
      // Load saved scenarios
      const saved = platformService.getSavedScenarios();
      setSavedScenarios(saved);

      // Add demo scenario to comparison list initially
      if (demoRes) {
        setComparisonList([{
          id: "DEMO",
          scenario_name: form.scenario_name,
          intervention_type: form.intervention_type,
          placement_rate: demoRes.projected.placement_rate,
          employment_rate: demoRes.projected.employment_rate,
          completion_rate: demoRes.projected.completion_rate,
          total_cost: demoRes.impact.total_cost,
          additional_placements: demoRes.impact.additional_placements
        }]);
      }
    } catch (err) {
      console.error("Failed to load baseline metrics", err);
    } finally {
      setLoadingBaseline(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [filters, store.last_updated]);

  // Form Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "additional_hours" || name === "affected_trainees" || name === "cost_per_trainee" || name === "duration_months" || name === "employer_count"
        ? (value === "" ? "" : Math.max(0, Number(value)))
        : value
    }));
  };

  // Run Simulation Handler
  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();

    if (!form.scenario_name.trim()) {
      alert("Please enter a Scenario Name.");
      return;
    }

    setIsSimulating(true);
    setFeedbackMsg(null);
    try {
      const res = await platformService.runPolicySimulation({
        scenario_name: form.scenario_name,
        intervention_type: form.intervention_type,
        parameters: {
          module_name: form.module_name,
          additional_hours: Number(form.additional_hours) || 20,
          affected_trainees: Number(form.affected_trainees) || (baseline?.total_trainees || 5240),
          cost_per_trainee: Number(form.cost_per_trainee) || 2500,
          relevance_level: form.relevance_level,
          duration_months: Number(form.duration_months) || 3,
          employer_count: Number(form.employer_count) || 15
        }
      }, filters);

      setSimulationResult(res);
      setFeedbackMsg("Simulation updated successfully based on scenario parameters.");
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      console.error("Simulation error", err);
      alert("Unable to run simulation. Please try again.");
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset Form Handler
  const handleReset = () => {
    const defaultTrainees = baseline?.total_trainees || 5240;
    setForm({
      scenario_name: "PLC Expansion – September 2026",
      intervention_type: "Add Training Module",
      module_name: "PLC Training",
      additional_hours: 20,
      affected_trainees: Math.min(4200, defaultTrainees),
      cost_per_trainee: 2500,
      relevance_level: "High",
      duration_months: 3,
      employer_count: 15
    });
    setFeedbackMsg("Scenario inputs reset to default parameters.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Save Scenario Handler
  const handleSaveScenario = () => {
    if (!simulationResult) return;
    const savedItem = platformService.saveScenario({
      scenario_name: form.scenario_name,
      intervention_type: form.intervention_type,
      parameters: form,
      baseline: simulationResult.baseline,
      projected: simulationResult.projected,
      impact: simulationResult.impact
    });
    setSavedScenarios(platformService.getSavedScenarios());
    setFeedbackMsg(`Scenario "${savedItem.scenario_name}" saved to Saved Simulations.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Saved Scenario Actions
  const handleViewScenario = (item) => {
    if (item.parameters) {
      setForm(prev => ({
        ...prev,
        scenario_name: item.scenario_name,
        intervention_type: item.intervention_type,
        ...item.parameters
      }));
    }
    // Re-run simulation with reloaded parameters
    platformService.runPolicySimulation({
      scenario_name: item.scenario_name,
      intervention_type: item.intervention_type,
      parameters: item.parameters || {}
    }, filters).then(res => {
      setSimulationResult(res);
      window.scrollTo({ top: 350, behavior: "smooth" });
    });
  };

  const handleDuplicateScenario = (id) => {
    platformService.duplicateScenario(id);
    setSavedScenarios(platformService.getSavedScenarios());
  };

  const handleDeleteScenario = (id) => {
    if (window.confirm("Are you sure you want to delete this saved simulation?")) {
      platformService.deleteScenario(id);
      setSavedScenarios(platformService.getSavedScenarios());
    }
  };

  // Add Current Scenario to Comparison Matrix
  const handleAddToComparison = () => {
    if (!simulationResult) return;
    const newEntry = {
      id: "CMP-" + Date.now().toString(36),
      scenario_name: form.scenario_name,
      intervention_type: form.intervention_type,
      placement_rate: simulationResult.projected.placement_rate,
      employment_rate: simulationResult.projected.employment_rate,
      completion_rate: simulationResult.projected.completion_rate,
      total_cost: simulationResult.impact.total_cost,
      additional_placements: simulationResult.impact.additional_placements
    };

    if (comparisonList.length >= 3) {
      setComparisonList([comparisonList[1], comparisonList[2], newEntry]);
    } else {
      setComparisonList([...comparisonList, newEntry]);
    }
    setFeedbackMsg(`Added "${form.scenario_name}" to Scenario Comparison Matrix below.`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Chart Data Preparation
  const chartData = simulationResult ? [
    {
      metric: "Placement Rate (%)",
      Baseline: simulationResult.baseline.placement_rate,
      Projected: simulationResult.projected.placement_rate
    },
    {
      metric: "Employment Rate (%)",
      Baseline: simulationResult.baseline.employment_rate,
      Projected: simulationResult.projected.employment_rate
    },
    {
      metric: "Completion Rate (%)",
      Baseline: simulationResult.baseline.completion_rate,
      Projected: simulationResult.projected.completion_rate
    },
    {
      metric: "Job Relevance Score",
      Baseline: simulationResult.baseline.job_relevance,
      Projected: simulationResult.projected.job_relevance
    },
    {
      metric: "Employer Sat. Rate",
      Baseline: simulationResult.baseline.employer_satisfaction,
      Projected: simulationResult.projected.employer_satisfaction
    }
  ] : [];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "4rem" }}>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "6px", background: "#eff6ff", display: "flex", alignItems: "center" }}>
            <Sliders size={20} color="#2563eb" />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            STRATEGIC POLICY & INTERVENTION SIMULATOR
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.4rem 0" }}>
          Policy Simulator
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Explore how hypothetical program changes could affect training and employment outcomes before implementation.
        </p>
      </div>

      {/* DECISION-SUPPORT ALERT BANNER */}
      <div style={{
        background: "#f0f9ff",
        border: "1px solid #bae6fd",
        borderRadius: "10px",
        padding: "1rem 1.25rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}>
        <Info size={20} color="#0284c7" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "0.88rem", color: "#0369a1", lineHeight: "1.45" }}>
          <strong>Decision-Support Notice:</strong> Use the simulator to experiment with hypothetical program modifications. Projections represent model-based scenario estimations derived from baseline data and parameter weights.
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #6ee7b7",
          color: "#047857",
          padding: "0.85rem 1.25rem",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.88rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <DataStateWrapper
        isLoading={loadingBaseline}
        data={baseline}
        isEmptyDetails="No active baseline metrics found."
      >
        {baseline && (
          <>
            {/* ── CURRENT PROGRAM SNAPSHOT ── */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <BarChart3 size={18} color="#475569" />
                  CURRENT PROGRAM SNAPSHOT (BASELINE SCOPE)
                </h2>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>
                  Scope: {baseline.total_trainees.toLocaleString()} Trainees
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                <div style={{ background: "white", padding: "1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                    Current Placement Rate
                  </span>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                    {baseline.placement_rate}%
                  </div>
                  <span style={{ fontSize: "0.73rem", color: "#64748b" }}>Formal employment</span>
                </div>

                <div style={{ background: "white", padding: "1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                    Employment Rate
                  </span>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                    {baseline.employment_rate}%
                  </div>
                  <span style={{ fontSize: "0.73rem", color: "#64748b" }}>Engaged in economy</span>
                </div>

                <div style={{ background: "white", padding: "1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                    Training Completion
                  </span>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                    {baseline.completion_rate}%
                  </div>
                  <span style={{ fontSize: "0.73rem", color: "#16a34a", fontWeight: 600 }}>Passed assessments</span>
                </div>

                <div style={{ background: "white", padding: "1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                    Average Monthly Income
                  </span>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                    ₹{baseline.average_income.toLocaleString()}
                  </div>
                  <span style={{ fontSize: "0.73rem", color: "#2563eb", fontWeight: 600 }}>Verified starting wage</span>
                </div>

                <div style={{ background: "white", padding: "1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                    Active Trainees
                  </span>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                    {baseline.total_trainees.toLocaleString()}
                  </div>
                  <span style={{ fontSize: "0.73rem", color: "#64748b" }}>Filtered dataset size</span>
                </div>

                <div style={{ background: "white", padding: "1.15rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                    Employer Partners
                  </span>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a" }}>
                    {baseline.employer_partners}
                  </div>
                  <span style={{ fontSize: "0.73rem", color: "#64748b" }}>Active hiring network</span>
                </div>
              </div>
            </div>

            {/* ── SCENARIO BUILDER SECTION ── */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "1.75rem", marginBottom: "2.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                    Build a What-If Scenario
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                    Configure hypothetical intervention parameters to calculate model-based projected outcomes.
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem", borderRadius: "20px", background: "#f1f5f9", color: "#475569", fontWeight: 700 }}>
                  Interactive Simulator
                </span>
              </div>

              <form onSubmit={handleRunSimulation}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>

                  {/* Scenario Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                      Scenario Name *
                    </label>
                    <input
                      type="text"
                      name="scenario_name"
                      value={form.scenario_name}
                      onChange={handleInputChange}
                      placeholder="e.g. PLC Training Expansion 2026"
                      required
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Intervention Type */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                      Intervention Type *
                    </label>
                    <select
                      name="intervention_type"
                      value={form.intervention_type}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        background: "white",
                        outline: "none"
                      }}
                    >
                      {INTERVENTION_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Fields based on Intervention Type */}
                  {(form.intervention_type === "Add Training Module" || form.intervention_type === "Custom Intervention") && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                        Module Name
                      </label>
                      <input
                        type="text"
                        name="module_name"
                        value={form.module_name}
                        onChange={handleInputChange}
                        placeholder="e.g. PLC Training"
                        style={{
                          width: "100%",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                          outline: "none"
                        }}
                      />
                    </div>
                  )}

                  {/* Additional Training Hours */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                      Additional Training Hours (Target: {120 + Number(form.additional_hours || 0)} hrs)
                    </label>
                    <input
                      type="number"
                      name="additional_hours"
                      value={form.additional_hours}
                      onChange={handleInputChange}
                      min="0"
                      max="200"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Expected Participants */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                      Expected Participating Trainees
                    </label>
                    <input
                      type="number"
                      name="affected_trainees"
                      value={form.affected_trainees}
                      onChange={handleInputChange}
                      min="1"
                      max={baseline.total_trainees}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Estimated Cost Per Trainee */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                      Estimated Cost Per Trainee (₹)
                    </label>
                    <input
                      type="number"
                      name="cost_per_trainee"
                      value={form.cost_per_trainee}
                      onChange={handleInputChange}
                      min="0"
                      step="500"
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Industry Relevance */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                      Employer Demand Relevance
                    </label>
                    <select
                      name="relevance_level"
                      value={form.relevance_level}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        background: "white",
                        outline: "none"
                      }}
                    >
                      <option value="High">High Relevance (High Hiring Demand)</option>
                      <option value="Medium">Medium Relevance (Moderate Demand)</option>
                      <option value="Low">Low Relevance (Niche Demand)</option>
                    </select>
                  </div>

                  {/* Additional parameters for apprenticeship / partnerships */}
                  {(form.intervention_type === "Apprenticeship Program" || form.intervention_type === "Employer Partnership Expansion") && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                        Participating Companies / Employer Network
                      </label>
                      <input
                        type="number"
                        name="employer_count"
                        value={form.employer_count}
                        onChange={handleInputChange}
                        min="1"
                        style={{
                          width: "100%",
                          padding: "0.6rem 0.85rem",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          outline: "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Form Action Controls */}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px dashed #e2e8f0" }}>
                  <button
                    type="submit"
                    disabled={isSimulating}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "0.75rem 1.75rem",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      cursor: isSimulating ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 2px 6px rgba(37,99,235,0.25)"
                    }}
                  >
                    {isSimulating ? (
                      <>
                        <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <span>Running Simulation...</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} fill="white" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: "white",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "0.75rem 1.25rem",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset Scenario</span>
                  </button>

                  {simulationResult && (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveScenario}
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          padding: "0.75rem 1.25rem",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <Save size={16} />
                        <span>Save Scenario</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddToComparison}
                        style={{
                          background: "#faf5ff",
                          color: "#7e22ce",
                          border: "1px solid #e9d5ff",
                          padding: "0.75rem 1.25rem",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <Layers size={16} />
                        <span>Compare Scenario</span>
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            {/* ── SIMULATION RESULT SECTION ── */}
            {simulationResult && (
              <div style={{ marginBottom: "3rem" }}>
                <div style={{ background: "white", borderRadius: "12px", border: "1px solid #93c5fd", padding: "1.75rem", boxShadow: "0 4px 16px rgba(37,99,235,0.08)" }}>

                  {/* Result Header */}
                  <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: "12px", background: "#dbeafe", color: "#1e40af" }}>
                          SIMULATION RESULT
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                          Model-Based Projection
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Scenario: "{form.scenario_name}"
                      </h3>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Intervention:</span>
                      <strong style={{ fontSize: "0.95rem", color: "#1e293b" }}>{form.intervention_type}</strong>
                    </div>
                  </div>

                  {/* Main Metric Cards Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>

                    {/* Placement Rate Card */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Placement Rate</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
                        <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#64748b", textDecoration: "line-through" }}>
                          {simulationResult.baseline.placement_rate}%
                        </span>
                        <span style={{ fontSize: "1.9rem", fontWeight: 900, color: "#16a34a" }}>
                          {simulationResult.projected.placement_rate}%
                        </span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.4rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "#dcfce7", color: "#15803d", fontSize: "0.78rem", fontWeight: 800 }}>
                        <TrendingUp size={14} />
                        <span>+{simulationResult.projected.placement_delta_pct}% Improvement</span>
                      </div>
                    </div>

                    {/* Additional Placements */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Est. Additional Placements</span>
                      <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#2563eb", marginTop: "0.4rem" }}>
                        +{simulationResult.impact.additional_placements.toLocaleString()}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Formal jobs created in scope</span>
                    </div>

                    {/* Affected Trainees */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Affected Trainees</span>
                      <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0f172a", marginTop: "0.4rem" }}>
                        {simulationResult.impact.affected_trainees.toLocaleString()}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Target candidate cohort</span>
                    </div>

                    {/* Estimated Total Cost */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Estimated Program Cost</span>
                      <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0f172a", marginTop: "0.4rem" }}>
                        ₹{(simulationResult.impact.total_cost / 10000000).toFixed(2)} Cr
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>₹{simulationResult.impact.cost_per_additional_placement.toLocaleString()} / additional placement</span>
                    </div>

                    {/* Projection Range Card */}
                    <div style={{ background: "#eff6ff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e40af" }}>Estimated Projection Range</span>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1d4ed8", marginTop: "0.4rem" }}>
                        {simulationResult.impact.range_min}% – {simulationResult.impact.range_max}%
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>Bounded confidence range</span>
                    </div>
                  </div>

                  {/* ── BEFORE VS AFTER VISUALIZATION (CHARTS) ── */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
                      BEFORE VS AFTER PROGRAM OUTCOME COMPARISON
                    </h4>
                    <div style={{ height: "300px", background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "#475569" }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} />
                          <Tooltip formatter={(val) => [`${val}%`, "Value"]} />
                          <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
                          <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Current Baseline" />
                          <Bar dataKey="Projected" fill="#2563eb" radius={[4, 4, 0, 0]} name="Simulated Program" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── IMPACT BREAKDOWN ── */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>

                    {/* Trainee Impact */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.8rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Users size={16} color="#2563eb" />
                        Trainee Impact
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#334155", lineHeight: "1.6" }}>
                        <li><strong>+{simulationResult.impact.additional_placements.toLocaleString()}</strong> additional formal job placements.</li>
                        <li><strong>+{simulationResult.impact.additional_employed.toLocaleString()}</strong> overall economic outcomes (including self-employed).</li>
                        <li>Average monthly income projected at <strong>₹{simulationResult.projected.average_income.toLocaleString()}</strong> (+₹{simulationResult.projected.income_delta.toLocaleString()}).</li>
                      </ul>
                    </div>

                    {/* Employer Impact */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.8rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Award size={16} color="#16a34a" />
                        Employer Impact
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#334155", lineHeight: "1.6" }}>
                        <li>Skill relevance score rises to <strong>{simulationResult.projected.job_relevance}%</strong>.</li>
                        <li>Employer satisfaction rate increases to <strong>{simulationResult.projected.employer_satisfaction}%</strong>.</li>
                        <li>Expands industry-ready candidates for key partner hiring pools.</li>
                      </ul>
                    </div>

                    {/* Program Impact */}
                    <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.8rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <DollarSign size={16} color="#0284c7" />
                        Program & Efficiency Impact
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#334155", lineHeight: "1.6" }}>
                        <li>Completion rate improves to <strong>{simulationResult.projected.completion_rate}%</strong> (+{simulationResult.projected.completion_delta_pct}%).</li>
                        <li>Total budget required: <strong>₹{(simulationResult.impact.total_cost / 10000000).toFixed(2)} Cr</strong>.</li>
                        <li>Cost efficiency: <strong>₹{simulationResult.impact.cost_per_additional_placement.toLocaleString()}</strong> per additional placed candidate.</li>
                      </ul>
                    </div>
                  </div>

                  {/* ── WHY DID THE PROJECTION CHANGE? ── */}
                  <div style={{ background: "#f1f5f9", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "1.5rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.6rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <HelpCircle size={18} color="#2563eb" />
                      Why did the projection change?
                    </h4>
                    <ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.2rem", fontSize: "0.88rem", color: "#334155", lineHeight: "1.6" }}>
                      {simulationResult.explanation.why_statements.map((stmt, idx) => (
                        <li key={idx} style={{ marginBottom: "0.3rem" }}>{stmt}</li>
                      ))}
                    </ul>

                    <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                        <Sparkles size={16} color="#7c3aed" />
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase" }}>
                          AI-Assisted Executive Synthesis
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "#334155", fontStyle: "italic", lineHeight: "1.5" }}>
                        "{simulationResult.explanation.ai_synthesis}"
                      </p>
                    </div>
                  </div>

                  {/* ── SIMULATION ASSUMPTIONS ── */}
                  <div style={{ background: "#fafafa", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e5e5" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#525252", display: "block", marginBottom: "0.4rem" }}>
                      Simulation Assumptions & Operational Bounds:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.78rem", color: "#656565", lineHeight: "1.5" }}>
                      <li>Projections are derived from historical patterns and input intervention weights for decision support.</li>
                      <li>Results represent estimated scenario outcomes, not guaranteed future placements.</li>
                      <li>Actual outcomes depend on employer market demand and trainee adoption in target districts.</li>
                      <li>Cost calculations assume the selected intervention reaches 100% of the specified participating trainees.</li>
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* ── MULTI-SCENARIO COMPARISON MATRIX ── */}
            {comparisonList.length > 0 && (
              <div style={{ background: "white", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "1.5rem", marginBottom: "2.5rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.3rem 0" }}>
                  Scenario Comparison Matrix
                </h3>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Side-by-side comparison of baseline vs configured hypothetical scenarios for objective decision evaluation.
                </p>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Metric / Dimension</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#0f172a", background: "#f1f5f9" }}>Current Baseline</th>
                        {comparisonList.map((sc, idx) => (
                          <th key={sc.id} style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#2563eb" }}>
                            Scenario {String.fromCharCode(65 + idx)}: {sc.scenario_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#334155" }}>Placement Rate</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a", background: "#f8fafc" }}>{baseline.placement_rate}%</td>
                        {comparisonList.map(sc => (
                          <td key={sc.id} style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#16a34a" }}>
                            {sc.placement_rate}%
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#334155" }}>Employment Rate</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a", background: "#f8fafc" }}>{baseline.employment_rate}%</td>
                        {comparisonList.map(sc => (
                          <td key={sc.id} style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>
                            {sc.employment_rate}%
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#334155" }}>Completion Rate</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a", background: "#f8fafc" }}>{baseline.completion_rate}%</td>
                        {comparisonList.map(sc => (
                          <td key={sc.id} style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>
                            {sc.completion_rate}%
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#334155" }}>Est. Additional Placements</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a", background: "#f8fafc" }}>0</td>
                        {comparisonList.map(sc => (
                          <td key={sc.id} style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#2563eb" }}>
                            +{sc.additional_placements.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#334155" }}>Estimated Total Cost</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a", background: "#f8fafc" }}>₹0</td>
                        {comparisonList.map(sc => (
                          <td key={sc.id} style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#0f172a" }}>
                            ₹{(sc.total_cost / 10000000).toFixed(2)} Cr
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SAVED SIMULATIONS TABLE ── */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #cbd5e1", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                    Saved Simulations
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                    Stored scenario configurations available for review, duplication, and execution.
                  </p>
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                  {savedScenarios.length} Saved Scenarios
                </span>
              </div>

              {savedScenarios.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.9rem", background: "#f8fafc", borderRadius: "8px" }}>
                  No saved simulations found. Build and save a scenario above to store it here.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Scenario</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Intervention</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Proj. Placement</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Target Trainees</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Est. Cost</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Created</th>
                        <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedScenarios.map(item => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#0f172a" }}>
                            {item.scenario_name}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", color: "#475569" }}>
                            {item.intervention_type}
                          </td>
                          <td style={{ padding: "0.85rem 1rem" }}>
                            <span style={{ fontWeight: 800, color: "#16a34a" }}>
                              {item.projected?.placement_rate || 76}%
                            </span>
                            {item.projected?.placement_delta_pct && (
                              <span style={{ fontSize: "0.75rem", color: "#15803d", marginLeft: "0.3rem" }}>
                                (+{item.projected.placement_delta_pct}%)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", color: "#334155" }}>
                            {(item.impact?.affected_trainees || 4200).toLocaleString()}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", color: "#334155" }}>
                            ₹{((item.impact?.total_cost || 10500000) / 10000000).toFixed(2)} Cr
                          </td>
                          <td style={{ padding: "0.85rem 1rem", color: "#64748b", fontSize: "0.8rem" }}>
                            {item.created_at}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => handleViewScenario(item)}
                                title="Reload Scenario into Simulator"
                                style={{
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  padding: "0.4rem 0.65rem",
                                  borderRadius: "6px",
                                  fontWeight: 700,
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.2rem"
                                }}
                              >
                                <Eye size={14} />
                                <span>View</span>
                              </button>

                              <button
                                onClick={() => handleDuplicateScenario(item.id)}
                                title="Duplicate Scenario"
                                style={{
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #cbd5e1",
                                  padding: "0.4rem 0.65rem",
                                  borderRadius: "6px",
                                  fontWeight: 700,
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.2rem"
                                }}
                              >
                                <Copy size={14} />
                                <span>Duplicate</span>
                              </button>

                              <button
                                onClick={() => handleDeleteScenario(item.id)}
                                title="Delete Scenario"
                                style={{
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "0.4rem 0.65rem",
                                  borderRadius: "6px",
                                  fontWeight: 700,
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.2rem"
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        )}
      </DataStateWrapper>
    </div>
  );
}
