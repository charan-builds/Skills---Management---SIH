import { List } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import DataValue from "../../components/common/DataValue";

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
      <div className="prog-table-wrapper" style={{ paddingBottom: '1.5rem' }}>
        <DataTable 
          columns={[
            { key: "name", label: "Programme Name", render: (p) => <strong>{p.name || p.id}</strong> },
            { key: "trainees", label: "Trainees", render: (p) => <DataValue value={p.trainees} zeroState="Insufficient data" /> },
            { key: "status", label: "Status", render: (p) => (
              <span className={`status-badge ${p.status === 'Active' ? 'good' : 'warning'}`}>
                {p.status || "Unknown"}
              </span>
            )}
          ]} 
          data={programmesData} 
          defaultSortKey="name" 
        />
      </div>
    </div>
  );
}
