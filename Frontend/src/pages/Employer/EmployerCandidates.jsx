import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  Users,
  Search,
  Sparkles,
  Star,
  CheckCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  X
} from "lucide-react";
import EmployerNav from "./EmployerNav";

export default function EmployerCandidates() {
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/candidates`);
      if (!res.ok) throw new Error("Failed to load candidates");
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load candidate matching pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [organizationId]);

  const handleToggleShortlist = async (traineeId) => {
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/candidates/${traineeId}/shortlist`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(prev => prev.map(c => c.id === traineeId ? { ...c, is_shortlisted: data.is_shortlisted } : c));
        if (selectedCandidate && selectedCandidate.id === traineeId) {
          setSelectedCandidate(prev => ({ ...prev, is_shortlisted: data.is_shortlisted }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const term = search.toLowerCase();
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(term) ||
      c.programme.toLowerCase().includes(term) ||
      c.skills.some(s => s.toLowerCase().includes(term));
    const matchesDistrict = districtFilter === "All" || c.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const districts = ["All", ...new Set(candidates.map(c => c.district).filter(Boolean))];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TALENT MATCHING ENGINE
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
            Find & Shortlist Skilled Candidates
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Candidates evaluated against your open job requisitions based on granular verified competencies.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Filter Toolbar */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.85rem' }}>
            <Search size={17} color="#64748b" />
            <input
              type="text"
              placeholder="Search candidate name, skill, or programme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>District:</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
            >
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            <p style={{ color: '#64748b' }}>Analyzing candidate skill profiles...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredCandidates.map(cand => {
              const match = cand.match_percentage || 80;
              const matchColor = match >= 85 ? '#16a34a' : '#2563eb';
              const matchBg = match >= 85 ? '#dcfce7' : '#eff6ff';

              return (
                <div
                  key={cand.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: matchBg, color: matchColor, fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} /> {match}% Match
                      </span>

                      <button
                        onClick={() => handleToggleShortlist(cand.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Star size={20} color={cand.is_shortlisted ? '#f59e0b' : '#94a3b8'} fill={cand.is_shortlisted ? '#f59e0b' : 'none'} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      {cand.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, margin: '0 0 0.75rem 0' }}>
                      {cand.programme}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                      <MapPin size={15} />
                      <span>{cand.district}</span>
                    </div>

                    {/* Skills list */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
                        Verified Competencies
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(cand.skills || []).map((sk, idx) => (
                          <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    style={{ width: '100%', background: '#ffffff', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '8px', padding: '0.65rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    View Matching Profile
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CANDIDATE DETAIL MODAL */}
        {selectedCandidate && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{selectedCandidate.name}</h3>
                  <p style={{ margin: 0, color: '#2563eb', fontWeight: 600, fontSize: '0.95rem' }}>{selectedCandidate.programme}</p>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.85rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
                  {selectedCandidate.match_percentage}% Match
                </span>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div><strong style={{ color: '#64748b' }}>District:</strong> {selectedCandidate.district}</div>
                  <div><strong style={{ color: '#64748b' }}>Status:</strong> {selectedCandidate.status}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Verified Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(selectedCandidate.skills || []).map((sk, idx) => (
                    <span key={idx} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => handleToggleShortlist(selectedCandidate.id)}
                  style={{ flex: 1, padding: '0.75rem', background: selectedCandidate.is_shortlisted ? '#fef3c7' : '#2563eb', color: selectedCandidate.is_shortlisted ? '#b45309' : '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Star size={17} fill={selectedCandidate.is_shortlisted ? '#b45309' : 'none'} />
                  {selectedCandidate.is_shortlisted ? "Shortlisted" : "Shortlist Candidate"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
