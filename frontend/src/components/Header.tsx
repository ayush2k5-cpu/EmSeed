import React, { useState } from 'react';
import SeedIcon from './SeedIcon';

interface AuditEntry {
    id: number;
    audit_id: string;
    event_type: string;
    employee_id: string | null;
    message_id: string | null;
    payload_summary: string | null;
    created_at: string;
}

export default function Header() {
    const [showAudit, setShowAudit] = useState(false);
    const [entries, setEntries] = useState<AuditEntry[] | null>(null);
    const [loading, setLoading] = useState(false);

    const openAuditLog = async () => {
        setShowAudit(true);
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/audit/log?limit=20`);
            const json = await response.json();
            setEntries(json.success ? json.data.entries : []);
        } catch (error) {
            console.error('Failed to fetch audit log:', error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-[56px] flex items-center justify-between px-6 border-b border-teal/20 bg-peach relative">
            <div className="flex items-center gap-2">
                <SeedIcon size={20} color="#789A99" animated={false} />
                <span className="font-serif text-[20px] text-teal">EmSeed</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="border border-teal text-teal text-[12px] font-sans px-3 py-1 rounded-full">
                    4 members
                </div>
                <span
                    onClick={openAuditLog}
                    className="text-muted text-[13px] font-sans cursor-pointer hover:text-teal transition-colors"
                >
                    Audit Log
                </span>
            </div>

            {showAudit && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
                        onClick={() => setShowAudit(false)}
                    />
                    <div className="absolute top-16 right-6 w-[min(420px,90vw)] max-h-[70vh] overflow-y-auto bg-peach rounded-[16px] shadow-[0_32px_80px_rgba(0,0,0,0.4)] p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-serif text-[18px] text-teal">Audit Log</h3>
                            <button
                                onClick={() => setShowAudit(false)}
                                className="text-teal/50 bg-transparent border-none cursor-pointer text-[14px]"
                            >
                                ✕
                            </button>
                        </div>

                        {loading && <p className="font-sans text-[13px] text-teal/50">Loading…</p>}

                        {!loading && entries && entries.length === 0 && (
                            <p className="font-sans text-[13px] text-teal/50">No audit entries yet.</p>
                        )}

                        {!loading && entries && entries.map((entry) => (
                            <div key={entry.id} className="border-b border-teal/10 py-3 last:border-0">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-sans text-[13px] font-medium text-teal">
                                        {entry.event_type}
                                    </span>
                                    <span className="font-sans text-[11px] text-teal/40">
                                        {entry.created_at}
                                    </span>
                                </div>
                                <div className="font-sans text-[12px] text-teal/60 mt-1">
                                    {entry.employee_id || '—'} · {entry.audit_id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
