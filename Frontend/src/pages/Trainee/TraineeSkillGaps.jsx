import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TraineeLayout from './TraineeLayout';
import { Target, ShieldCheck, AlertTriangle, TrendingDown } from 'lucide-react';
import { fetchAuth } from '../../utils/authFetch';
import { API_BASE } from '../../utils/config';
import DataTable from "../../components/common/DataTable";
import { DataStateWrapper } from "../../components/common/DataStateComponents";

export default function TraineeSkillGaps() {
  const { traineeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [trainee, setTrainee] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const gapRes = await fetchAuth(`${API_BASE}/api/trainees/${traineeId}/skill-gaps`);
      const traineeRes = await fetchAuth(`${API_BASE}/api/trainees/${traineeId}`);
      if (!gapRes.ok) throw new Error("Failed to load skill gaps data");
      if (!traineeRes.ok) throw new Error("Failed to load trainee profile");
      const gapData = await gapRes.json();
      const traineeData = await traineeRes.json();
      setData(gapData);
      setTrainee(traineeData);
    } catch (err) {
      console.error("Error fetching skill gaps", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [traineeId]);

  const hasData = () => data && data.status !== "NO_BENCHMARK";
  
  const emptyStateContent = (
    <div style={{ textAlign: 'center' }}>
      <Target size={48} color="#94a3b8" style={{ marginBottom: '1rem', display: 'inline-block' }} />
      <h2 style={{ margin: '0 0 0.5rem 0' }}>No Benchmark Pathway Selected</h2>
      <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
        To calculate authoritative skill gaps, you must first select an occupational benchmark pathway in your profile settings.
      </p>
      <button onClick={() => navigate('/trainee/profile')} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
        Set Benchmark Pathway
      </button>
    </div>
  );

  return (
    <TraineeLayout activeTab="skill-gaps" portalData={trainee}>
      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={data}
        onRetry={fetchData}
        isDataAvailable={hasData}
        isEmptyDetails={emptyStateContent}
      >
        {() => {
          const { gaps } = data;
          return (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Skill Gap Intelligence</h1>
                <p style={{ color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={16} /> Benchmark Pathway: <strong>{gaps[0]?.benchmark_source || "Target Role"}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Critical Gaps</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626' }}>
                    {gaps.filter(g => g.priority === 'CRITICAL').length}
                  </div>
                </div>
                <div style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>High Priority Gaps</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316' }}>
                    {gaps.filter(g => g.priority === 'HIGH').length}
                  </div>
                </div>
                <div style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase' }}>Met Requirements</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>
                    {/* Met requirements aren't returned in the `gaps` array if > 0 logic is strict, but assuming gaps represent deficits */}
                    -
                  </div>
                </div>
              </div>

              {gaps.length === 0 ? (
                <div style={{ padding: '3rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <ShieldCheck size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                  <h3>No Skill Gaps Identified</h3>
                  <p style={{ color: '#64748b' }}>Your verified skills meet or exceed the requirements for your target benchmark.</p>
                </div>
              ) : (
                <div style={{ paddingBottom: '1.5rem' }}>
                  <DataTable 
                    columns={[
                      { key: "skill", label: "Skill", render: (g) => <strong style={{ color: '#0f172a' }}>{g.skill}</strong> },
                      { key: "current", label: "Current", render: (g) => (
                        (g.evidence_state === 'NO_EVIDENCE' || g.evidence_state === 'INSUFFICIENT_SKILL_EVIDENCE') ? (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Not Assessed</span>
                        ) : (
                          <strong style={{ color: '#3b82f6' }}>{g.current_proficiency}</strong>
                        )
                      )},
                      { key: "required", label: "Required", render: (g) => <strong style={{ color: '#0f172a' }}>{g.required_proficiency}</strong> },
                      { key: "gap_size", label: "Gap", render: (g) => (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                          <TrendingDown size={14} /> {g.gap_size}
                        </span>
                      )},
                      { key: "priority", label: "Priority", render: (g) => (
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '12px',
                          background: g.priority === 'CRITICAL' ? '#fef2f2' : g.priority === 'HIGH' ? '#fff7ed' : '#f0fdf4',
                          color: g.priority === 'CRITICAL' ? '#dc2626' : g.priority === 'HIGH' ? '#c2410c' : '#15803d'
                        }}>
                          {g.priority}
                        </span>
                      )},
                      { key: "evidence_state", label: "Evidence", render: (g) => (
                        g.evidence_state === 'VERIFIED_ASSESSMENT' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}><ShieldCheck size={14}/> Verified Assessment</span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b' }}><AlertTriangle size={14}/> Insufficient Evidence</span>
                        )
                      )}
                    ]} 
                    data={gaps} 
                    defaultSortKey="skill" 
                  />
                </div>
              )}
            </>
          );
        }}
      </DataStateWrapper>
    </TraineeLayout>
  );
}
