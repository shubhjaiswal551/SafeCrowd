import React, { useState } from 'react';
import type { Alert } from '../../types/crowdEvent';

interface SnapshotModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string, notes: string, isFalsePositive: boolean) => void;
}

const SnapshotModal: React.FC<SnapshotModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!alert) return null;

  const isCam1 = alert.cameraId === 'cam-001';
  const videoSrc = alert.snapshotUrl || (isCam1
    ? '/12269404_2320_1080_30fps.mp4'
    : '/5287069-sd_960_540_30fps.mp4');

  const handleDispatchSecurity = () => {
    if (onAcknowledge) onAcknowledge(alert.id);
    setActionSuccess('Physical security team alerted and dispatched.');
    setTimeout(() => {
      setActionSuccess(null);
    }, 4000);
  };

  const handleMarkFalsePositive = () => {
    if (onResolve) {
      onResolve(alert.id, 'Marked as false positive by operator', true);
    } else if (onAcknowledge) {
      onAcknowledge(alert.id);
    }
    setActionSuccess('Incident flagged as False Positive.');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (onResolve) {
      onResolve(alert.id, resolutionNotes || 'Resolved normal crowd flow.', false);
    } else if (onAcknowledge) {
      onAcknowledge(alert.id);
    }
    setActionSuccess('Incident resolved and archived to incident history.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-lg bg-bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg-secondary shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${
                alert.severity === 'critical' || alert.severity === 'high'
                  ? 'bg-danger'
                  : 'bg-warn'
              }`}
            />
            <div className="text-xs font-semibold text-text-primary font-mono uppercase tracking-wider">
              EVIDENCE CAPTURE · {alert.id.toUpperCase()}
            </div>
            {alert.numericSeverity && (
              <span className="chip-critical font-mono text-[10px]">
                LEVEL {alert.numericSeverity}/5
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Frozen / Active Video Frame */}
          <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-black border border-border">
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded border border-white/10">
              FRAME CAPTURE · {new Date(alert.timestamp).toLocaleTimeString()} UTC
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded border border-white/10">
              SENSOR: {alert.cameraId.toUpperCase()} [{alert.zoneName}]
            </div>
          </div>

          {actionSuccess && (
            <div className="p-2.5 rounded bg-safe-bg border border-safe/30 text-safe-light text-xs font-mono">
              ✓ {actionSuccess}
            </div>
          )}

          {/* Telemetry Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Incident Type</div>
              <div className="font-semibold text-text-primary mt-0.5 truncate capitalize">{alert.type}</div>
            </div>
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Zone Location</div>
              <div className="font-semibold text-text-primary mt-0.5 truncate">{alert.zoneName}</div>
            </div>
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Severity Level</div>
              <div className="font-semibold text-danger-light mt-0.5 uppercase">
                {alert.numericSeverity ? `${alert.numericSeverity} / 5` : alert.severity}
              </div>
            </div>
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Triage Status</div>
              <div className="font-semibold mt-0.5 uppercase text-text-secondary">
                {alert.acknowledged ? 'ACKNOWLEDGED' : 'PENDING ACTION'}
              </div>
            </div>
          </div>

          {/* Analytics Tier Mathematical Vector Data (schema.md) */}
          {alert.metrics && (
            <div className="p-3 rounded bg-bg-secondary border border-border text-xs font-mono space-y-1.5">
              <div className="text-[10px] font-semibold text-text-primary uppercase tracking-wider">
                Pipeline Mathematical Metrics (Analytics Tier)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-text-secondary">
                <div>Density: <span className="font-semibold text-text-primary">{alert.metrics.density} p/m²</span></div>
                <div>Variance (σ²): <span className="font-semibold text-text-primary">{alert.metrics.velocity_variance}</span></div>
                <div>Flow Vector: <span className="font-semibold text-text-primary">[{Array.isArray(alert.metrics.flow_vector) ? alert.metrics.flow_vector.join(', ') : '0, 0'}]</span></div>
                <div>Headcount: <span className="font-semibold text-text-primary">{alert.metrics.headcount}</span></div>
              </div>
            </div>
          )}

          {/* Resolution Form Accordion */}
          {showResolveForm && (
            <form onSubmit={handleConfirmResolve} className="p-3 rounded border border-border bg-bg-secondary space-y-2">
              <div className="text-xs font-semibold text-text-primary font-mono">
                Operator Incident Resolution Notes
              </div>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken (e.g. security physical response arrived, gates opened, flow restored)..."
                className="input-field text-xs h-16 w-full font-mono"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="btn-secondary text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-[11px]"
                >
                  Confirm & Resolve
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions (AppFlow.md Operator Journey) */}
        <div className="px-5 py-3 border-t border-border bg-bg-secondary flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] font-mono text-text-muted">
            {alert.acknowledgedBy ? `OPERATOR: ${alert.acknowledgedBy}` : 'AWAITING OPERATOR TRIAGE'}
          </div>

          <div className="flex items-center gap-2">
            {!alert.acknowledged && (
              <>
                <button
                  type="button"
                  onClick={handleMarkFalsePositive}
                  className="px-3 py-1.5 rounded text-xs font-mono font-medium border border-border hover:bg-bg-tertiary transition-colors text-text-secondary"
                >
                  False Positive
                </button>
                <button
                  type="button"
                  onClick={handleDispatchSecurity}
                  className="px-3 py-1.5 rounded text-xs font-mono font-medium bg-warn text-white hover:bg-warn-dark transition-colors"
                >
                  Dispatch Security
                </button>
              </>
            )}

            {!showResolveForm && (
              <button
                type="button"
                onClick={() => setShowResolveForm(true)}
                className="btn-primary"
              >
                Resolve Incident
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotModal;
