import React, { useState, useEffect } from 'react';
import { mockVitals } from '../data/mockData';

// Calculate actual team resonance average from mock vitals
const teamAvg = Math.round(mockVitals.reduce((sum, v) => sum + v.score, 0) / mockVitals.length);

export default function VitalsTab() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col w-full">
            <div className="font-sans text-[12px] text-teal/50 mb-6">Live · Updated just now</div>

            {mockVitals.map((vital) => {
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
