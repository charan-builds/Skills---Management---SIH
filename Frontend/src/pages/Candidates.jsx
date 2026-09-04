import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  ArrowRight,
  UserRound,
  Sparkles,
  Bookmark,
  Mail,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployerNav from "./Employer/EmployerNav";

export default function Candidates() {
  const navigate = useNavigate();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState("All Programmes");
  const [location, setLocation] = useState("All Locations");
  const [minMatch, setMinMatch] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("match_desc");

  // Contact Modal State
  const [contactModalCand, setContactModalCand] = useState(null);
  const [contactNote, setContactNote] = useState("Hello, we reviewed your profile on the Skilling Intelligence Portal and would like to invite you for an initial technical interview for our open vacancy.");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [shortlistedMap, setShortlistedMap] = useState({});
  const [contactedMap, setContactedMap] = useState({});

  useEffect(() => {
    const fetchCandidates = () => {
      setLoading(true);
    fetchAuth(`${API_BASE}/api/employers/${organizationId}/candidates`)
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data || []);
        const sMap = {};
        const cMap = {};
        (data || []).forEach(c => {
          if (c.is_shortlisted) sMap[c.id] = true;
          if (c.is_contacted) cMap[c.id] = true;
        });
        setShortlistedMap(sMap);
        setContactedMap(cMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    };

    fetchCandidates();
  }, [organizationId]);

  const handleToggleShortlist = async (candId) => {
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainee_id: candId, job_id: "JOB-DEMO-001A" })
      });
      const data = await res.json();
      setShortlistedMap(prev => ({
        ...prev,
        [candId]: data.shortlisted
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendContact = async () => {
    if (!contactModalCand) return;
    try {
      await fetchAuth(`${API_BASE}/api/employers/${organizationId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainee_id: contactModalCand.id, message: contactNote })
      });
      setContactedMap(prev => ({ ...prev, [contactModalCand.id]: true }));
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setContactModalCand(null);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setProgramme("All Programmes");
    setLocation("All Locations");
    setMinMatch("All");
    setStatusFilter("All");
    setSortBy("match_desc");
  };

  const filteredCandidates = useMemo(() => {
    let result = candidates.filter((candidate) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        (candidate.name || "").toLowerCase().includes(searchText) ||
        (candidate.id || "").toLowerCase().includes(searchText) ||
        (candidate.skills || []).some((skill) =>
          (typeof skill === 'string' ? skill : skill.name).toLowerCase().includes(searchText)
        );

      const matchesProgramme =
        programme === "All Programmes" ||
        candidate.programme === programme;

      const matchesLocation =
        location === "All Locations" ||
        (candidate.location || "").toLowerCase().includes(location.toLowerCase());

      const matchVal = Number(candidate.match) || 0;
      const matchesMatch =
        minMatch === "All" ||
        matchVal >= Number(minMatch);

      const matchesStatus =
        statusFilter === "All" ||
        (candidate.status || "").toLowerCase().includes(statusFilter.toLowerCase());

      return (
        matchesSearch &&
        matchesProgramme &&
        matchesLocation &&
        matchesMatch &&
        matchesStatus
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "match_desc") return (b.match || 0) - (a.match || 0);
      if (sortBy === "match_asc") return (a.match || 0) - (b.match || 0);
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "location") return (a.location || "").localeCompare(b.location || "");
      return 0;
    });

    return result;
  }, [candidates, search, programme, location, minMatch, statusFilter, sortBy]);

  const uniqueProgrammes = [...new Set(candidates.map(c => c.programme).filter(Boolean))].sort();
  const uniqueLocations = [...new Set(candidates.map(c => c.location ? c.location.split(',')[0].trim() : null).filter(Boolean))].sort();

  // Metrics
  const totalCount = candidates.length;
  const strongMatchesCount = candidates.filter(c => (c.match || 0) >= 90).length;
  const shortlistedCount = Object.values(shortlistedMap).filter(Boolean).length;
  const contactedCount = Object.values(contactedMap).filter(Boolean).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
          Loading candidate talent pool...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CANDIDATE DISCOVERY & SELECTION
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Candidate Talent Pool
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Filter certified candidates, analyze AI skill alignment, and initiate recruitment outreach.
          </p>
        </div>

        {/* TOP SUMMARY METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Candidates Found</span>
            <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{filteredCandidates.length}</h3>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Strong Matches (90%+)</span>
            <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>{strongMatchesCount}</h3>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Shortlisted</span>
            <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>{shortlistedCount}</h3>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Contacted</span>
            <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{contactedCount}</h3>
          </div>

        </div>

        {/* SEARCH & FILTERS CONTROLS BAR (WHITE BACKGROUND, CRISP DARK TEXT) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', padding: '1.5rem', marginBottom: '2.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Search Candidate
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search name, Trainee ID, or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                />
              </div>
            </div>

            {/* Programme Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Programme
              </label>
              <select
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="All Programmes">All Programmes</option>
                {uniqueProgrammes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="All Locations">All Locations</option>
                {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Match % Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Match Threshold
              </label>
              <select
                value={minMatch}
                onChange={(e) => setMinMatch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="All">Any Match %</option>
                <option value="90">90%+ (Strong Match)</option>
                <option value="80">80%+ (High Match)</option>
                <option value="70">70%+ (Qualified)</option>
              </select>
            </div>

          </div>

          {/* Sub-Filters: Sort By & Clear Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <option value="match_desc">Highest Match %</option>
                  <option value="match_asc">Lowest Match %</option>
                  <option value="name_asc">Candidate Name (A-Z)</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Certification:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Certified">Certified Only</option>
                  <option value="Ready">Employment Ready</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} /> Clear Filters
            </button>
          </div>

        </div>

        {/* CANDIDATES LIST CARDS */}
        {filteredCandidates.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
            {filteredCandidates.map((cand) => {
              const isShortlisted = Boolean(shortlistedMap[cand.id]);
              const isContacted = Boolean(contactedMap[cand.id]);
              const matchVal = Number(cand.match) || 85;

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
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    {/* Card Header: Avatar, Name, ID, Match Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.05rem' }}>
                          {cand.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <strong style={{ fontSize: '1.15rem', color: '#0f172a', display: 'block' }}>{cand.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            {cand.id} • {cand.programme}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: matchVal >= 90 ? '#dcfce7' : '#eff6ff', color: matchVal >= 90 ? '#15803d' : '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800 }}>
                          {matchVal}% Match
                        </span>
                      </div>
                    </div>

                    {/* Location, Experience, Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>
                      <span><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> {cand.location}</span>
                      <span>•</span>
                      <span>{cand.experience || "Fresher / Certified"}</span>
                      <span>•</span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ {cand.status || "Certified"}</span>
                    </div>

                    {/* Skill Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                      {cand.skills?.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          ✓ {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>

                    {/* AI Insight Box */}
                    <div style={{ background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '3px solid #2563eb', marginBottom: '1.25rem' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.45 }}>
                        <strong>AI Insight:</strong> "{cand.reasoning}"
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleShortlist(cand.id)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          background: isShortlisted ? '#fef3c7' : '#ffffff',
                          border: isShortlisted ? '1px solid #fde68a' : '1px solid #cbd5e1',
                          color: isShortlisted ? '#b45309' : '#334155',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Bookmark size={13} fill={isShortlisted ? "#b45309" : "none"} />
                        {isShortlisted ? "Shortlisted ✓" : "Shortlist"}
                      </button>

                      <button
                        onClick={() => setContactModalCand(cand)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          background: isContacted ? '#dcfce7' : '#ffffff',
                          border: isContacted ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                          color: isContacted ? '#15803d' : '#2563eb',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Mail size={13} />
                        {isContacted ? "Contacted ✓" : "Contact"}
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/employer/candidates/${cand.id}`)}
                      style={{
                        padding: '0.5rem 1.05rem',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      View Profile <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <UserRound size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No candidates match your current filters</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>Try adjusting your search terms or threshold.</p>
            <button
              onClick={handleClearFilters}
              style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>

      {/* CONTACT CANDIDATE MODAL */}
      {contactModalCand && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>OUTREACH GATEWAY</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Contact {contactModalCand.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Trainee ID: {contactModalCand.id} • {contactModalCand.programme}</span>
              </div>
              <button onClick={() => setContactModalCand(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            {contactSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem' }}>Introduction Request Sent!</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  The candidate and placement coordinator have been notified through the portal.
                </p>
              </div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.4rem 0', color: '#334155' }}><strong>Email:</strong> {contactModalCand.id.toLowerCase()}@example.com (Masked)</p>
                  <p style={{ margin: '0 0 0.4rem 0', color: '#334155' }}><strong>Phone:</strong> +91 98*** ***** (Verified State Portal Record)</p>
                  <p style={{ margin: 0, color: '#334155' }}><strong>Availability:</strong> Immediate Joining / 2 Weeks Notice</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Introductory Message / Interview Invitation
                  </label>
                  <textarea
                    value={contactNote}
                    onChange={(e) => setContactNote(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', height: '90px', background: '#ffffff', color: '#0f172a' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    onClick={() => setContactModalCand(null)}
                    style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendContact}
                    style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Send Introduction
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
