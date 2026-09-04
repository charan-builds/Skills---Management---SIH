import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';

export default function TraineeFormModal({ isOpen, onClose, trainee, onSuccess }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    district: '',
    programme_id: '',
    course_name: '',
    provider: '',
    status: 'In Training',
    outcome: 'Pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!trainee;

  useEffect(() => {
    if (trainee) {
      setFormData({
        id: trainee.id || '',
        name: trainee.name || '',
        email: trainee.email || '',
        phone: trainee.phone || '',
        district: trainee.district || '',
        programme_id: trainee.rawProgrammeId || trainee.programme_id || '',
        course_name: trainee.programme || trainee.course_name || '',
        provider: trainee.rawProvider || trainee.provider || '',
        status: trainee.rawStatus || trainee.status || 'In Training',
        outcome: trainee.rawOutcome || trainee.outcome || 'Pending'
      });
    } else {
      // Auto-generate a dummy ID if creating
      setFormData(prev => ({
        ...prev,
        id: `TR-${Math.floor(1000 + Math.random() * 9000)}`
      }));
    }
  }, [trainee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `${API_BASE}/api/trainees/${formData.id}` : `${API_BASE}/api/trainees`;
      const method = isEdit ? 'PATCH' : 'POST';

      const token = localStorage.getItem("sih_token");
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail) || "Failed to save trainee.";
        throw new Error(errorMessage);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{isEdit ? 'Edit Trainee' : 'Add New Trainee'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='transparent'}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Trainee ID</label>
              <input
                type="text"
                name="id"
                required
                value={formData.id}
                onChange={handleChange}
                disabled={isEdit}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', backgroundColor: isEdit ? '#f8fafc' : '#ffffff', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Phone</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>District</label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Programme ID</label>
              <input
                type="text"
                name="programme_id"
                required
                value={formData.programme_id}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Course Name</label>
              <input
                type="text"
                name="course_name"
                required
                value={formData.course_name}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Provider</label>
              <input
                type="text"
                name="provider"
                required
                value={formData.provider}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', backgroundColor: '#ffffff' }}
              >
                <option value="In Training">In Training</option>
                <option value="Completed">Completed</option>
                <option value="Dropped Out">Dropped Out</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Outcome</label>
              <select
                name="outcome"
                value={formData.outcome}
                onChange={handleChange}
                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', backgroundColor: '#ffffff' }}
              >
                <option value="Pending">Pending</option>
                <option value="Placed">Placed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Higher Education">Higher Education</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Trainee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
