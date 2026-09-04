import React, { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = ["id", "name", "email", "phone", "district", "programme_id", "course_name", "provider", "status", "outcome"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
      "TR-9001,John Doe,john@example.com,9876543210,Hyderabad,PRG-001,Data Analytics,TechFlow,In Training,Pending\n" +
      "TR-9002,Jane Smith,jane@example.com,9876543211,Warangal,PRG-002,Cybersecurity,TechFlow,Completed,Placed";
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trainees_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error("CSV file is empty or missing data rows.");
    
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ["id", "name", "email", "phone", "district", "programme_id", "course_name", "provider", "status", "outcome"];
    
    for (const req of requiredHeaders) {
      if (!headers.includes(req)) {
        throw new Error(`Missing required column: ${req}`);
      }
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;
      
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      data.push(row);
    }
    
    return data;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = parseCSV(event.target.result);
          setPreviewData(parsed);
        } catch (err) {
          setError(err.message);
          setPreviewData(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!previewData || previewData.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem("sih_token");
      const res = await fetch(`${API_BASE}/api/trainees/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(previewData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail) || "Failed to import trainees.";
        throw new Error(errorMessage);
      }
      
      setSuccess(`Successfully imported ${previewData.length} trainees!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Bulk Import Trainees</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#1e3a8a' }}>Need the template?</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#1d4ed8' }}>Download the required CSV format.</p>
            </div>
            <button 
              onClick={handleDownloadTemplate}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} /> Template
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Upload CSV File</label>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', transition: 'background-color 0.2s' }}>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Upload size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' }}>
                  Click to browse
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {file ? file.name : "or drag and drop CSV file here"}
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Import Error</p>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} />
              <p style={{ margin: 0, fontWeight: 600 }}>{success}</p>
            </div>
          )}

          {previewData && !error && !success && (
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                  <FileText size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ready to import</span>
                </div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                  {previewData.length} records
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0' }}>The file was parsed successfully and matches the required schema.</p>
              
              <button
                onClick={handleImport}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? 'Importing...' : 'Confirm and Import'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
