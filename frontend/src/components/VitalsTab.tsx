import React, { useState, useEffect } from 'react';
import { mockVitals, teamMembers } from '../data/mockData';
import type { VitalBar } from '../types';

function scoreToEnergyLevel(score: number): VitalBar['energyLevel'] {
    if (score >= 85) return 'energised';
    if (score >= 70) return 'strong';
    if (score >= 50) return 'good';
    if (score >= 25) return 'neutral';
    return 'depleted';
}

async function fetchLiveVitals(): Promise<VitalBar[] | null> {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/team/team_alpha/pulse`);
        const json = await response.json();
        if (!json.success || !json.data?.members) return null;

        // The DB still carries legacy demo employees (emp_001/2/3) under the same
        // team_id — only show the current roster the rest of the UI knows about.
        return json.data.members
            .filter((m: any) => teamMembers.some((t) => t.id === m.employee_id))
            .map((m: any) => {
                const known = teamMembers.find((t) => t.id === m.employee_id)!;
                const score = m.last_resonance ?? m.resonance_7day_avg ?? 0;
                return {
                    memberId: m.employee_id,
                    name: known.name,
                    score,
                    energyLevel: scoreToEnergyLevel(score),
                    emoji: m.last_emoji || '—',
                    isAlert: m.last_resonance !== null && score < 25
                };
            });
    } catch (error) {
        console.error('Failed to fetch live team pulse, falling back to mock vitals:', error);
        return null;
    }
}

export default function VitalsTab() {
    const [mounted, setMounted] = useState(false);
    const [vitals, setVitals] = useState<VitalBar[]>(mockVitals);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);

        fetchLiveVitals().then((live) => {
            if (live && live.length > 0) {
                setVitals(live);
                setIsLive(true);
            }
        });

        return () => clearTimeout(timer);
    }, []);

    const teamAvg = Math.round(vitals.reduce((sum, v) => sum + v.score, 0) / vitals.length);

    return (
        <div className="flex flex-col w-full">
            <div className="font-sans text-[12px] text-teal/50 mb-6">
                {isLive ? 'Live · Updated just now' : 'Demo data · backend unreachable'}
            </div>

            {vitals.map((vital) => {
                let bgColorClass = '';
                let customStyle: React.CSSProperties = {
                    width: mounted ? `${vital.score}%` : '0%'
                };

                switch (vital.energyLevel) {
                    case 'energised': bgColorClass = 'bg-teal'; break;
                    case 'strong': bgColorClass = 'bg-teal/80'; break;
                    case 'good': bgColorClass = 'bg-teal/60'; break;
                    case 'neutral': bgColorClass = 'bg-teal/40'; break;
                    case 'depleted':
                        customStyle.backgroundColor = '#E8736A';
                        break;
                }

                return (
                    <div key={vital.memberId} className="flex items-center gap-4 mb-5">
                        <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center">
                            <span className="font-sans text-[13px] font-medium text-peach">
                                {vital.name.charAt(0)}
                            </span>
                        </div>

                        <div className="font-sans text-[15px] text-teal w-24 shrink-0">
                            {vital.name}
                        </div>

                        <div className="flex-1 h-2 bg-teal/15 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${bgColorClass}`}
                                style={customStyle}
                            />
                        </div>

                        <div className="text-[18px]">{vital.emoji}</div>

                        {vital.isAlert && <span className="text-[14px]">⚠️</span>}
                    </div>
                );
            })}

            <div className="mt-8">
                <div className="font-sans text-[12px] uppercase tracking-[0.1em] text-teal/60 mb-2">
                    TEAM RESONANCE
                </div>
                <div className="flex items-center">
                    <div className="flex-1 h-2 bg-teal/15 rounded-full overflow-hidden max-w-[57%]">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out bg-teal/40"
                            style={{ width: mounted ? `${teamAvg}%` : '0%' }}
                        />
                    </div>
                    <span className="font-sans text-[14px] text-teal ml-3">
                        {teamAvg >= 70 ? 'Strong' : teamAvg >= 50 ? 'Moderate' : 'At Risk'}
                    </span>
                </div>
            </div>
        </div>
    );
}
