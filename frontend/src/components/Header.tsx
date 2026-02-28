import React from 'react';
import SeedIcon from './SeedIcon';

export default function Header() {
    return (
        <div className="w-full h-[56px] flex items-center justify-between px-6 border-b border-teal/20 bg-peach">
            <div className="flex items-center gap-2">
                <SeedIcon size={20} color="#789A99" animated={false} />
                <span className="font-serif text-[20px] text-teal">EmSeed</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="border border-teal text-teal text-[12px] font-sans px-3 py-1 rounded-full">
                    4 members
                </div>
                <span className="text-muted text-[13px] font-sans cursor-pointer">
                    Audit Log
                </span>
            </div>
        </div>
    );
}
