import React from 'react';
import { mockHistory } from '../data/mockData';

export default function HistoryTab() {
    return (
        <div className="flex flex-col gap-4 w-full">
            {mockHistory.map((entry, index) => {
                let badgeClass = '';
                let badgeText = '';

                switch (entry.status) {
                    case 'responded':
                        badgeClass = 'bg-teal/20 text-teal';
                        badgeText = '↩ Responded';
                        break;
                    case 'seen':
                        badgeClass = 'bg-teal/10 text-teal/70';
                        badgeText = '👁 Seen';
                        break;
                    case 'delivered':
                        badgeClass = 'bg-muted/10 text-muted';
                        badgeText = '✓ Delivered';
                        break;
                }

                return (
                    <div
                        key={entry.id}
                        className="bg-white/30 border border-teal/20 rounded-[12px] p-5 animate-fade-up opacity-0 relative"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-sans text-[15px] font-medium text-teal">
                                    {entry.memberName}
                                </div>
                                <div className="font-sans text-[12px] text-teal/50">
                                    DISC-{entry.discType} · {entry.discLabel}
                                </div>
                            </div>
                            <div className={`text-[11px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                                {badgeText}
                            </div>
                        </div>

                        <p
                            className="mt-3 font-sans text-[13px] text-teal/80 leading-relaxed truncate"
                            title={entry.message}
                        >
                            {entry.message}
                        </p>

                        <div className="mt-2 font-sans text-[11px] text-muted">
                            {entry.timestamp}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
