import React from 'react';
import type { Alert } from '../../types/crowdEvent';

interface SnapshotModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge?: (id: string) => void;
}

const SnapshotModal: React.FC<SnapshotModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
}) => {
  if (!alert) return null;

  const isCam1 = alert.cameraId === 'cam-001';
  const videoSrc = isCam1
    ? '/12269404_2320_1080_30fps.mp4'
    : '/5287069-sd_960_540_30fps.mp4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-lg bg-bg-card border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg-secondary">
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
        <div className="p-5 space-y-4">
          {/* Frozen Video Frame with Tactical Reticles */}
          <div className="relative aspect-[16/9] w-full rounded overflow-hidden bg-black border border-border">
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Simulated Bounding Box on Evidence Frame */}
            <div
              className="absolute pointer-events-none border-2 border-danger bg-danger/10"
              style={{
                top: '32%',
                left: '42%',
                width: '18%',
                height: '35%',
              }}
            >
              <div className="absolute -top-5 left-0 bg-danger text-white text-[9px] font-mono px-1.5 py-0.5 rounded-sm font-semibold tracking-wider">
                {alert.type.toUpperCase()} · 94% CONF
              </div>
            </div>

            {/* Corner Bracket Reticles */}
            <div className="absolute top-2 left-2 text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded border border-white/10">
              FRAME CAPTURE · {new Date(alert.timestamp).toISOString()}
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded border border-white/10">
              OPTICAL SENSOR: {alert.cameraId.toUpperCase()} [{alert.zoneName}]
            </div>
          </div>

          {/* Telemetry Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Incident Type</div>
              <div className="font-semibold text-text-primary mt-0.5 truncate">{alert.type}</div>
            </div>
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Zone Location</div>
              <div className="font-semibold text-text-primary mt-0.5 truncate">{alert.zoneName}</div>
            </div>
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Severity Classification</div>
              <div className="font-semibold text-danger-light mt-0.5 uppercase">{alert.severity}</div>
            </div>
            <div className="p-2.5 rounded bg-bg-secondary border border-border">
              <div className="text-[9px] text-text-muted uppercase">Triage Status</div>
              <div className="font-semibold mt-0.5 uppercase text-text-secondary">
                {alert.acknowledged ? 'ACKNOWLEDGED' : 'PENDING ACTION'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 border-t border-border bg-bg-secondary flex items-center justify-between">
          <div className="text-[11px] font-mono text-text-muted">
            {alert.acknowledgedBy ? `ACKNOWLEDGED BY: ${alert.acknowledgedBy}` : 'AWAITING OPERATOR ACKNOWLEDGEMENT'}
          </div>
          <div className="flex items-center gap-2">
            {!alert.acknowledged && onAcknowledge && (
              <button
                type="button"
                onClick={() => {
                  onAcknowledge(alert.id);
                  onClose();
                }}
                className="btn-primary"
              >
                Acknowledge Incident
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotModal;
