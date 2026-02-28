import React from 'react';

interface AlertBannerProps {
    onKillSwitch: () => void;
}

export default function AlertBanner({ onKillSwitch }: AlertBannerProps) {
    return (
        <div className="w-full animate-slide-down">
            <div className="bg-[#FFE8E6] border border-[#E8736A] rounded-[14px] p-6 mb-5">
                <div className="font-sans text-[14px] font-semibold text-[#E8736A]">
                    ⚠️ Disengagement Signal Detected
                </div>

                <div className="mt-3 font-sans text-[14px] text-teal">
                    Granth's energy has dropped across 3 consecutive signals.
                    Disengagement may be spreading. Act before it compounds.
                </div>

                <div className="mt-4 flex gap-3">
                    <button className="border border-teal text-teal bg-transparent font-sans text-[13px] px-4 py-2 rounded-[8px] cursor-pointer">
                        Send a message
                    </button>
                    <button className="border border-teal text-teal bg-transparent font-sans text-[13px] px-4 py-2 rounded-[8px] cursor-pointer">
                        View Granth's signals
                    </button>
                </div>

                <div className="mt-5 mb-5 border-t border-[#E8736A]/30"></div>

                <button
                    onClick={onKillSwitch}
                    className="w-full py-4 rounded-[12px] bg-[#E8736A] text-white font-serif text-[16px] animate-pulse-slow"
                >
                    Initiate Human Connect →
                </button>

                <div className="mt-3 font-sans text-[11px] text-muted text-center">
                    EmSeed will step back. You step forward.
                </div>
            </div>
        </div>
    );
}
