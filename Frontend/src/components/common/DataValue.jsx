export default function DataValue({ value, isPercentage = false, zeroState = "0" }) {
  if (value === undefined || value === null) {
    return <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 'normal' }}>No data</span>;
  }
  
  if (value === 0) {
    // Zero is a valid value, but we still allow explicit overrides if requested
    // (though components should prefer using DataStateWrapper for these states)
    if (zeroState === "No data") return <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 'normal' }}>No data</span>;
    if (zeroState === "Not applicable") return <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 'normal' }}>N/A</span>;
    if (zeroState === "Insufficient data") return <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 'normal' }}>Insufficient data</span>;
    
    // Default to rendering actual 0
    return <span>0{isPercentage ? '%' : ''}</span>;
  }

  // Prevent NaN or Infinite percentages if someone manually passed 0/0
  if (isPercentage && (Number.isNaN(value) || !Number.isFinite(value))) {
      return <span style={{ color: '#94a3b8', fontSize: '0.85em', fontWeight: 'normal' }}>No data</span>;
  }
  
  return <span>{value}{isPercentage ? '%' : ''}</span>;
}
