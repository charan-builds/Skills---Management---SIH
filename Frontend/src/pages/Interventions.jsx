import { useState, useEffect } from "react";
import {
  Play,
  GitBranch,
  Zap,
  Check
} from "lucide-react";
import { API_BASE } from "../utils/config";
import { fetchAuth } from "../utils/authFetch";
import { adminIntelligenceData } from "../utils/adminData";

export default function Interventions() {
  const [programmes, setProgrammes] = useState(adminIntelligenceData.programmes);
  const [selectedProgramme, setSelectedProgramme] = useState("P001");
  const [selectedSkill, setSelectedSkill] = useState("Python");
  
  useEffect(() => {
    async function loadProgrammes() {
      try {
        const res = await fetchAuth(`${API_BASE}/api/programmes`);
        if (res.ok) {
          const liveData = await res.json();
          const merged = adminIntelligenceData.programmes.map(mockProg => {
            const liveProg = liveData.find(p => p.id === mockProg.id);
            return liveProg ? { ...mockProg, name: liveProg.name, enrolled: liveProg.trainees } : mockProg;
          });
          liveData.forEach(liveProg => {
            if (!merged.find(p => p.id === liveProg.id)) {
              merged.push({ id: liveProg.id, name: liveProg.name, enrolled: liveProg.trainees });
            }
          });
          setProgrammes(merged);
        }
      } catch (err) {
        console.error("Failed to load programmes:", err);
      }
    }
    loadProgrammes();
  }, []);
  const [increaseAmount, setIncreaseAmount] = useState(15);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState({
    baseline_gap: "38% Skill Deficit",
    projected_gap: "14% Skill Deficit",
    gap_reduction: "-24% Gap Reduction",
    projected_employment_boost: "+12.4% Projected Placement",
    estimated_roi: "3.8x Training Return",
    affected_trainees: 140
  });

  const [actions, setActions] = useState(adminIntelligenceData.action_center_items);
  const [adoptedActions, setAdoptedActions] = useState({});

  const handleRunSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      const prog = programmes.find(p => p.id === selectedProgramme) || programmes[0];
      setSimulationResult({
        baseline_gap: `${40 - Math.round(increaseAmount * 0.8)}% Skill Deficit`,
        projected_gap: `${Math.max(8, 40 - Math.round(increaseAmount * 1.6))}% Skill Deficit`,
        gap_reduction: `-${Math.round(increaseAmount * 1.5)}% Gap Reduction`,
        projected_employment_boost: `+${(increaseAmount * 0.85).toFixed(1)}% Projected Placement`,
        estimated_roi: `${(2.2 + increaseAmount * 0.1).toFixed(1)}x Training Return`,
        affected_trainees: prog.enrolled
      });
      setSimulating(false);
    }, 800);
  };

  const handleAdoptAction = (actionId) => {
    setAdoptedActions(prev => ({
      ...prev,
      [actionId]: true
    }));
  };

  const prog = programmes.find(p => p.id === selectedProgramme) || programmes[0];

  return (
    <div className="dashboard" style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <GitBranch size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              SCENARIO MODELLING & POLICY INTERVENTIONS
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            What-If Policy & Curriculum Simulator
          </h1>
          <p className="page-description" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Model the systemic employment and gap-reduction impact of curriculum adjustments before committing state training funds.
          </p>
        </div>
      </div>

      {/* SIMULATOR INTERACTIVE WORKBENCH */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
          Interactive Intervention Scenario Builder
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1.25rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Target Programme
            </label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {programmes.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Skill to Bolster
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {prog.top_skills.concat(prog.missing_skills).map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Curriculum Proficiency Delta (+%)
            </label>
            <select
              value={increaseAmount}
              onChange={(e) => setIncreaseAmount(Number(e.target.value))}
              style={{ width: '100%', padding: '0.65rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value={10}>+10% Proficiency Boost (15 Lab Hours)</option>
              <option value={15}>+15% Proficiency Boost (30 Lab Hours)</option>
              <option value={25}>+25% Proficiency Boost (50 Lab Hours + Capstone)</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            style={{
              padding: '0.65rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              height: '42px'
            }}
          >
            <Play size={15} fill="white" />
            {simulating ? "Simulating Impact..." : "Run Simulation"}
          </button>

        </div>

        {/* SIMULATION PROJECTED IMPACT DASHBOARD */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              PROJECTED SYSTEMIC OUTCOME
            </span>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
              ✓ High Confidence AI Simulation
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Baseline Industry Gap</span>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{simulationResult.baseline_gap}</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current state deficit</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Estimated Gap Reduction</span>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>{simulationResult.gap_reduction}</h4>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Down to {simulationResult.projected_gap}</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Employment Boost</span>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>{simulationResult.projected_employment_boost}</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Affecting {simulationResult.affected_trainees} trainees</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Projected Economic ROI</span>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed' }}>{simulationResult.estimated_roi}</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Net state wage generation</span>
            </div>

          </div>
        </div>

      </div>

      {/* EXECUTIVE INTERVENTIONS ACTION CENTER */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Executive Policy Interventions Queue
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              Prioritized actions for state skilling directors to optimize training resource allocation.
            </p>
          </div>
          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
            {actions.length} Pending Policies
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {actions.map((act) => {
            const isAdopted = Boolean(adoptedActions[act.id]);
            return (
              <div
                key={act.id}
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{act.programme}</span>
                    <span style={{ background: act.priority.includes('High') ? '#fee2e2' : '#fef3c7', color: act.priority.includes('High') ? '#b91c1c' : '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {act.priority}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {act.title}
                  </h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    <strong>District:</strong> {act.district}
                  </p>
                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                    <strong>Action:</strong> {act.suggested_action}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleAdoptAction(act.id)}
                    disabled={isAdopted}
                    style={{
                      padding: '0.45rem 1rem',
                      background: isAdopted ? '#dcfce7' : '#2563eb',
                      color: isAdopted ? '#15803d' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: isAdopted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {isAdopted ? <Check size={14} /> : <Zap size={14} />}
                    {isAdopted ? "Policy Adopted" : "Adopt Policy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
