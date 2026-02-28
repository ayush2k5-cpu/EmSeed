import React from 'react';
import type { DashboardState } from '../types';
import VitalsTab from './VitalsTab';
import HistoryTab from './HistoryTab';
import AlertBanner from './AlertBanner';
import SeedIcon from './SeedIcon';

interface OutputPanelProps {
    activeTab: 'vitals' | 'history';
    onTabChange: (tab: 'vitals' | 'history') => void;
    currentState: DashboardState;
    onKillSwitch: () => void;
}

export default function OutputPanel({
    activeTab,
    onTabChange,
    currentState,
    onKillSwitch
}: OutputPanelProps) {

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center flex-1 h-full gap-3">
            <div className="opacity-30">
                <SeedIcon size={40} color="#789A99" animated={false} />
            </div>
            <div className="flex flex-col items-center">
                <p className="font-sans italic text-[14px] text-teal/50 text-center">Messages sent will appear here</p>
                <p className="font-sans italic text-[14px] text-teal/50 text-center">as your team responds.</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full p-10 bg-peach">
            <div className="flex items-end border-b border-teal/20 mb-6">
                {(['vitals', 'history'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`mr-8 capitalize transition-all duration-200 ${activeTab === tab
                            ? 'font-serif text-[16px] text-teal border-b-2 border-teal pb-3'
                            : 'font-sans text-[16px] text-teal/50 pb-3 border-b-2 border-transparent'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto">
                {(currentState === 'modal') && renderEmptyState()}

                {(currentState === 'default' || currentState === 'vitals' || currentState === 'alert' || currentState === 'killswitch') && (
                    <div className="flex flex-col w-full h-full">
                        {currentState === 'alert' && <AlertBanner onKillSwitch={onKillSwitch} />}
                        {activeTab === 'vitals' ? <VitalsTab /> : <HistoryTab />}
                    </div>
                )}
            </div>
        </div>
    );
}
