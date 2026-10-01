import React from 'react';
import type {
  Incident,
  IncidentStatus,
  AlertSeverity,
} from '../../types/crowdEvent';

interface IncidentFiltersProps {
  zones: string[];
  selectedZone: string;
  onZoneChange: (v: string) => void;
  selectedSeverity: string;
  onSeverityChange: (v: string) => void;
  selectedStatus: string;
  onStatusChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  onReset: () => void;
}

const severityChipClass = (s: AlertSeverity | 'all'): string => {
  if (s === 'critical') return 'chip-critical';
  if (s === 'high') return 'chip-danger';
  if (s === 'warning') return 'chip-warn';
  if (s === 'info') return 'chip-safe';
  return 'chip bg-bg-tertiary text-text-secondary border-border';
};

const statusChipClass = (s: IncidentStatus): string => {
  if (s === 'resolved') return 'chip-safe';
  if (s === 'acknowledged') return 'chip-warn';
  return 'chip-danger';
};

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  zones,
  selectedZone,
  onZoneChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}) => {
  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-text-primary">Filters</div>
          <div className="text-[11px] text-text-muted mt-0.5">
            Narrow down the incident log
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-text-secondary hover:text-accent transition-colors"
        >
          Reset all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="label-sm">Zone / Camera</label>
          <select
            className="input-field text-sm"
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
          >
            <option value="all">All zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="label-sm">Severity</label>
          <select
            className="input-field text-sm"
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="label-sm">Status</label>
          <select
            className="input-field text-sm"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="label-sm">From</label>
          <input
            type="date"
            className="input-field text-sm"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="label-sm">To</label>
          <input
            type="date"
            className="input-field text-sm"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="label-sm">Active selection</label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className={severityChipClass(selectedSeverity as AlertSeverity | 'all')}>
              {selectedSeverity.toUpperCase()}
            </span>
            <span className={statusChipClass(selectedStatus as IncidentStatus)}>
              {selectedStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IncidentTableProps {
  incidents: Incident[];
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onAcknowledge,
  onResolve,
}) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-secondary/50 text-left">
              <th className="px-4 py-3 label-sm font-medium">Timestamp</th>
              <th className="px-4 py-3 label-sm font-medium">Zone</th>
              <th className="px-4 py-3 label-sm font-medium">Alert Type</th>
              <th className="px-4 py-3 label-sm font-medium">Severity</th>
              <th className="px-4 py-3 label-sm font-medium">Status</th>
              <th className="px-4 py-3 label-sm font-medium">Operator</th>
              <th className="px-4 py-3 label-sm font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-text-muted text-xs"
                >
                  No incidents match the current filters.
                </td>
              </tr>
            ) : (
              incidents.map((inc, idx) => (
                <tr
                  key={inc.id}
                  className={`border-b border-border-subtle/60 hover:bg-bg-tertiary/40 transition-colors ${
                    idx % 2 === 1 ? 'bg-bg-tertiary/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 mono text-[12px] text-text-secondary whitespace-nowrap">
                    {new Date(inc.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-text-primary font-medium whitespace-nowrap">
                    {inc.zoneName}
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                    {inc.alertType}
                  </td>
                  <td className="px-4 py-3">
                    <span className={severityChipClass(inc.severity)}>
                      {inc.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusChipClass(inc.status)}>
                      {inc.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                    {inc.acknowledgedBy ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {inc.status === 'open' && onAcknowledge && (
                        <button
                          type="button"
                          onClick={() => onAcknowledge(inc.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-accent-bg border border-accent/40 text-accent hover:bg-accent hover:text-bg-primary transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(inc.status === 'open' ||
                        inc.status === 'acknowledged') &&
                        onResolve && (
                          <button
                            type="button"
                            onClick={() => onResolve(inc.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-safe-bg border border-safe/30 text-safe-light hover:bg-safe hover:text-bg-primary transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
