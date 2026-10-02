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
  return 'chip bg-slate-100 text-slate-600 border-slate-200';
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
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900 tracking-tight">Search & Filters</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Filter incident records by zone, severity tier, or status
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors"
        >
          Reset All Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Zone / Sensor</label>
          <select
            className="input-field text-xs rounded-xl"
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
          >
            <option value="all">All Zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Severity Tier</label>
          <select
            className="input-field text-xs rounded-xl"
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Triage Status</label>
          <select
            className="input-field text-xs rounded-xl"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Date From</label>
          <input
            type="date"
            className="input-field text-xs rounded-xl"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Date To</label>
          <input
            type="date"
            className="input-field text-xs rounded-xl"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
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
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">Zone</th>
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">Anomaly Type</th>
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">Severity</th>
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">Status</th>
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">Handled By</th>
              <th className="px-4 py-3 text-[11px] uppercase text-slate-500 font-semibold tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-slate-400 font-medium text-xs"
                >
                  No recorded incidents match criteria
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap tabular-nums">
                    {new Date(inc.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-semibold whitespace-nowrap">
                    {inc.zoneName}
                  </td>
                  <td className="px-4 py-3 text-slate-700 capitalize max-w-xs truncate font-medium">
                    {inc.alertType}
                  </td>
                  <td className="px-4 py-3">
                    <span className={severityChipClass(inc.severity)}>
                      {inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusChipClass(inc.status)}>
                      {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {inc.acknowledgedBy ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {inc.status === 'open' && onAcknowledge && (
                        <button
                          type="button"
                          onClick={() => onAcknowledge(inc.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-95 transition-all shadow-sm"
                        >
                          Acknowledge
                        </button>
                      )}
                      {(inc.status === 'open' || inc.status === 'acknowledged') && onResolve && (
                        <button
                          type="button"
                          onClick={() => onResolve(inc.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
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
