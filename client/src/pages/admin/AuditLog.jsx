import React, { useState, useEffect } from 'react';
import { FileText, Clock, User, ChevronRight, ChevronDown } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { formatDate } from '../../utils/formatTime.js';

export const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/audit-log');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hospital Staff Activity & Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological immutable history of every bed change, doctor status toggle, and profile modification.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading audit trail...</div>
      ) : logs.length === 0 ? (
        <Card>
          <CardBody className="p-8 text-center text-slate-500">
            No audit records logged yet.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <Card key={log.id} className="border-slate-200">
                <CardBody className="p-4">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm">{log.action}</span>
                          <Badge variant="neutral" size="sm">Audit</Badge>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {log.admin_email}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto">
                        <span className="font-bold text-slate-500 block mb-1">Previous Values:</span>
                        <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-mono">
                          {log.old_value ? JSON.stringify(log.old_value, null, 2) : 'None (New Record)'}
                        </pre>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto">
                        <span className="font-bold text-slate-500 block mb-1">Updated Values:</span>
                        <pre className="text-[11px] text-teal-800 whitespace-pre-wrap font-mono">
                          {log.new_value ? JSON.stringify(log.new_value, null, 2) : 'None (Deleted)'}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
