import React, { useState, useEffect } from 'react';
import SeedIcon from './SeedIcon';

interface KillSwitchProps {
    onExit: () => void;
    employeeName?: string;
}

export default function KillSwitch({ onExit, employeeName }: KillSwitchProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-[800ms] ${mounted ? 'bg-void' : 'bg-[#FFD2C2]'
                }`}
        >
            <div
                className="opacity-0 animate-word-reveal"
                style={{ animationDelay: '0s', animationFillMode: 'forwards' }}
            >
                <div className="opacity-60 mb-12">
                    <SeedIcon size={32} color="#E8E0FF" animated={false} />
                </div>
            </div>

            <div
                className="font-sans text-[18px] font-light tracking-[0.08em] text-ghost mb-8 text-center opacity-0 animate-word-reveal"
                style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
            >
                EmSeed is stepping back.
            </div>

            <div
                className="font-sans text-[20px] text-ghost mb-3 text-center opacity-0 animate-word-reveal"
                style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}
            >
                {employeeName || 'This team member'} doesn't need a better message.
            </div>

            <div
                className="font-serif text-[40px] text-ghost text-center opacity-0 animate-word-reveal"
                style={{ animationDelay: '2s', animationFillMode: 'forwards' }}
            >
                He needs you.
            </div>

            <div
                className="opacity-0 animate-word-reveal"
                style={{ animationDelay: '2.6s', animationFillMode: 'forwards' }}
            >
                <div className="w-[120px] h-[1px] bg-ember mx-auto my-12" />
            </div>

            <div
                className="flex flex-col gap-3 max-w-[280px] mx-auto opacity-0 animate-word-reveal w-full"
                style={{ animationDelay: '3s', animationFillMode: 'forwards' }}
            >
                <button
                    onClick={onExit}
                    className="w-full bg-transparent border border-ghost/30 text-ghost font-sans text-[15px] px-7 py-3.5 rounded-[10px] cursor-pointer hover:border-ghost/100 hover:bg-ghost/5 transition-all duration-200"
                >
                    Schedule a conversation
                </button>
                <button
                    onClick={onExit}
                    className="w-full bg-transparent border border-ghost/30 text-ghost font-sans text-[15px] px-7 py-3.5 rounded-[10px] cursor-pointer hover:border-ghost/100 hover:bg-ghost/5 transition-all duration-200"
                >
                    Send a personal note instead
                </button>
            </div>

            <div
                className="absolute bottom-8 left-0 right-0 text-center font-sans text-[11px] text-ghost/30 tracking-[0.05em] opacity-0 animate-word-reveal"
                style={{ animationDelay: '3.5s', animationFillMode: 'forwards' }}
            >
                This is HumAIn First®. Technology knows when to stop.
            </div>
        </div>
    );
}
