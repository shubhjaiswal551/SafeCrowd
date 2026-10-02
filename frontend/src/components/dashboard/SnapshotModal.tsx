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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-floating overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 shrink-0">
          <div className="flex items-center gap-3">
            {/* macOS Window dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-slate-800 tracking-tight">
              Incident Evidence Preview · {alert.id.toUpperCase()}
            </div>
            {alert.numericSeverity && (
              <span className="chip-critical font-medium text-[11px]">
                Level {alert.numericSeverity} / 5
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Frozen / Active Evidence Media */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-sm">
            {videoSrc.match(/\.(jpeg|jpg|png|webp)($|\?)/i) ? (
              <img
                src={videoSrc.startsWith('/snapshots/') ? `http://localhost:8000${videoSrc}` : videoSrc}
                alt="Anomaly Snapshot Evidence"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-3 left-3 text-[11px] font-sans font-medium text-white/95 bg-black/60 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
              Evidence Recording · {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
            <div className="absolute bottom-3 right-3 text-[11px] font-sans font-medium text-white/95 bg-black/60 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
              Sensor: {alert.cameraId.toUpperCase()} ({alert.zoneName})
            </div>
          </div>

          {actionSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              ✓ {actionSuccess}
            </div>
          )}

          {/* Telemetry Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Incident Type</div>
              <div className="font-semibold text-slate-900 mt-1 truncate capitalize text-sm">{alert.type}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Zone Location</div>
              <div className="font-semibold text-slate-900 mt-1 truncate text-sm">{alert.zoneName}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Severity Level</div>
              <div className="font-semibold text-rose-600 mt-1 uppercase text-sm">
                {alert.numericSeverity ? `${alert.numericSeverity} / 5` : alert.severity}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Triage Status</div>
              <div className="font-semibold mt-1 uppercase text-slate-700 text-sm">
                {alert.acknowledged ? 'Acknowledged' : 'Pending Action'}
              </div>
            </div>
          </div>

          {/* Analytics Tier Mathematical Vector Data */}
          {alert.metrics && (
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs space-y-2">
              <div className="text-xs font-semibold text-slate-800">
                Mathematical Perception Telemetry
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                <div>Density: <span className="font-semibold text-slate-900 tabular-nums">{alert.metrics.density} p/m²</span></div>
                <div>Speed Variance (σ²): <span className="font-semibold text-slate-900 tabular-nums">{alert.metrics.velocity_variance}</span></div>
                <div>Flow Vector: <span className="font-semibold text-slate-900">[{Array.isArray(alert.metrics.flow_vector) ? alert.metrics.flow_vector.join(', ') : '0, 0'}]</span></div>
                <div>Headcount: <span className="font-semibold text-slate-900 tabular-nums">{alert.metrics.headcount}</span></div>
              </div>
            </div>
          )}

          {/* Resolution Form Accordion */}
          {showResolveForm && (
            <form onSubmit={handleConfirmResolve} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="text-xs font-semibold text-slate-800">
                Operator Incident Resolution Notes
              </div>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken (e.g. security physical response arrived, gates opened, flow restored)..."
                className="input-field text-xs h-20 w-full"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Confirm & Resolve
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-medium">
            {alert.acknowledgedBy ? `Handled by ${alert.acknowledgedBy}` : 'Awaiting Operator Triage'}
          </div>

          <div className="flex items-center gap-2.5">
            {!alert.acknowledged && (
              <>
                <button
                  type="button"
                  onClick={handleMarkFalsePositive}
                  className="btn-secondary"
                >
                  False Positive
                </button>
                <button
                  type="button"
                  onClick={handleDispatchSecurity}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ff9500] text-white hover:bg-[#e08500] transition-all shadow-sm active:scale-95"
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
