import { AlertCircle, Loader2, Database, ShieldAlert } from 'lucide-react';

export function LoadingState({ message = "Loading..." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#64748b' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
      <span style={{ fontSize: '0.9rem' }}>{message}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#ef4444', background: '#fef2f2', borderRadius: '8px' }}>
      <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
      <strong style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Unable to load data</strong>
      <span style={{ fontSize: '0.85rem', color: '#991b1b', textAlign: 'center', maxWidth: '300px' }}>
        {error?.message || error || "A network or server error occurred."}
      </span>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "No data available", details = "No records match the current criteria." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#64748b', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
      <Database size={24} style={{ marginBottom: '0.5rem', color: '#94a3b8' }} />
      <strong style={{ fontSize: '1rem', color: '#334155', marginBottom: '0.25rem' }}>{message}</strong>
      {details && <span style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '300px' }}>{details}</span>}
    </div>
  );
}

export function InsufficientDataState({ message = "Insufficient data", reason = "Minimum cohort size not met." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#f59e0b', background: '#fffbeb', borderRadius: '8px' }}>
      <ShieldAlert size={24} style={{ marginBottom: '0.5rem' }} />
      <strong style={{ fontSize: '1rem', color: '#b45309', marginBottom: '0.25rem' }}>{message}</strong>
      {reason && <span style={{ fontSize: '0.85rem', color: '#92400e', textAlign: 'center', maxWidth: '300px' }}>{reason}</span>}
    </div>
  );
}

export function NotApplicableState({ message = "Not applicable", details }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#64748b', background: '#f1f5f9', borderRadius: '8px' }}>
      <strong style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.25rem' }}>{message}</strong>
      {details && <span style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '300px' }}>{details}</span>}
    </div>
  );
}

export function UnauthorizedState({ message = "You don't have permission to view this information." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#ef4444', background: '#fef2f2', borderRadius: '8px' }}>
      <ShieldAlert size={24} style={{ marginBottom: '0.5rem' }} />
      <strong style={{ fontSize: '1rem', color: '#991b1b', marginBottom: '0.25rem' }}>Unauthorized</strong>
      <span style={{ fontSize: '0.85rem', color: '#991b1b', textAlign: 'center', maxWidth: '300px' }}>{message}</span>
    </div>
  );
}

export function NotFoundState({ message = "Not found", details = "The requested entity could not be found." }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
      <strong style={{ fontSize: '1rem', color: '#334155', marginBottom: '0.25rem' }}>{message}</strong>
      <span style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '300px' }}>{details}</span>
    </div>
  );
}

/**
 * A wrapper to standardise data state rendering.
 * 
 * Props:
 * - isLoading (bool)
 * - error (Error or string or falsy)
 * - data (any)
 * - isDataAvailable (bool or function(data) returning bool) - defaults to checking if data exists and array is non-empty
 * - isInsufficientData (bool or function(data) returning bool) - defaults to checking data.insufficient_data if object
 * - insufficientReason (string or function(data) returning string)
 * - isEmptyDetails (string or function(data) returning string)
 * - onRetry (function)
 */
/**
 * A wrapper to standardise data state rendering across the Five Core States + Unauthorized + Not Found.
 */
export function DataStateWrapper({
  isLoading,
  error,
  data,
  isUnauthorized,
  unauthorizedMessage,
  isNotFound,
  notFoundDetails,
  isDataAvailable,
  isInsufficientData,
  insufficientReason,
  isEmptyDetails,
  onRetry,
  children
}) {
  if (isLoading) return <LoadingState />;
  if (isUnauthorized) return <UnauthorizedState message={unauthorizedMessage} />;
  if (isNotFound) return <NotFoundState details={notFoundDetails} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  // Determine availability
  let available = false;
  if (isDataAvailable !== undefined) {
    available = typeof isDataAvailable === 'function' ? isDataAvailable(data) : isDataAvailable;
  } else {
    // Default heuristic
    if (data === undefined || data === null) {
      available = false;
    } else if (Array.isArray(data)) {
      available = data.length > 0;
    } else if (typeof data === 'object') {
      if ('data_available' in data) {
        available = data.data_available;
      } else {
        available = Object.keys(data).length > 0;
      }
    } else {
      available = true;
    }
  }

  if (!available) {
    const details = typeof isEmptyDetails === 'function' ? isEmptyDetails(data) : isEmptyDetails;
    return <EmptyState details={details} />;
  }

  // Determine insufficiency
  let insufficient = false;
  let reason = "Minimum cohort size not met.";
  if (isInsufficientData !== undefined) {
    insufficient = typeof isInsufficientData === 'function' ? isInsufficientData(data) : isInsufficientData;
    if (insufficientReason) {
      reason = typeof insufficientReason === 'function' ? insufficientReason(data) : insufficientReason;
    }
  } else if (data && typeof data === 'object' && data.insufficient_data) {
    insufficient = true;
    if (data.reason) reason = data.reason;
    if (insufficientReason) {
      reason = typeof insufficientReason === 'function' ? insufficientReason(data) : insufficientReason;
    }
  }

  if (insufficient) {
    return <InsufficientDataState reason={reason} />;
  }

  return <>{children}</>;
}

/**
 * Transparent mode indicator banner.
 */
export function ModeBanner({ mode = "Simulation / Development Mode" }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfeff 100%)',
      border: '1px solid #bbf7d0',
      color: '#166534',
      padding: '0.4rem 1rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
        <span><strong>Environment:</strong> {mode}</span>
        <span style={{ color: '#15803d', fontWeight: 400 }}>• Cross-panel reactive state synchronization active</span>
      </div>
      <span style={{ fontSize: '0.75rem', color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
        Mock Service Adapter
      </span>
    </div>
  );
}

