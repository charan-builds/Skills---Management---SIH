import { List } from "lucide-react";

export default function ImpactProgrammeComparison({ programmesData }) {
  if (!programmesData || programmesData.length === 0) {
    return (
      <div className="impact-card">
        <h2><List size={20} /> Programme Comparison</h2>
        <p style={{color: "#64748b"}}>No programme data available.</p>
      </div>
    );
  }

  return (
    <div className="impact-card">
      <h2><List size={20} /> Programme Comparison</h2>
      <div className="prog-table-wrapper">
        <table className="prog-table">
          <thead>
            <tr>
              <th>Programme Name</th>
              <th>Trainees</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {programmesData.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name || p.id}</strong></td>
                <td>{p.trainees || 0}</td>
                <td>
                  <span className={`status-badge ${p.status === 'Active' ? 'good' : 'warning'}`}>
                    {p.status || "Unknown"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
