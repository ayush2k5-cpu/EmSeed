import React from 'react';
import { teamMembers } from '../data/mockData';
import SeedIcon from './SeedIcon';

interface ComposePanelProps {
    message: string;
    onMessageChange: (val: string) => void;
    selectedRecipients: string[];
    onRecipientToggle: (id: string) => void;
    language: 'en' | 'hi';
    onLanguageToggle: () => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export default function ComposePanel({
    message,
    onMessageChange,
    selectedRecipients,
    onRecipientToggle,
    language,
    onLanguageToggle,
    isGenerating,
    onGenerate
}: ComposePanelProps) {
    return (
        <div className="flex flex-col h-full p-10 bg-peach">
            <label className="font-sans text-[13px] tracking-[0.1em] text-teal uppercase mb-3">
                WHAT DO YOU WANT TO SAY?
            </label>

            <textarea
                className="w-full h-[180px] resize-none bg-white/40 border border-teal/30 rounded-[12px] p-4 font-sans text-[16px] text-teal placeholder-italic placeholder-muted/70 focus:outline-none focus:border-teal"
                placeholder="Type your message exactly as you'd normally send it..."
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
            />

            <label className="mt-6 font-sans text-[13px] uppercase tracking-[0.1em] text-teal">
                TO:
            </label>

            <div className="mt-2 flex flex-wrap gap-2">
                {teamMembers.map((member) => {
                    const isSelected = selectedRecipients.includes(member.id);
                    return (
                        <button
                            key={member.id}
                            onClick={() => onRecipientToggle(member.id)}
                            className={`rounded-[20px] px-4 py-2 text-[14px] font-sans cursor-pointer transition-all duration-200 ${isSelected ? 'bg-teal text-peach' : 'border border-teal text-teal bg-transparent'
                                }`}
                        >
                            {member.name} {isSelected ? '✓' : ''}
                        </button>
                    );
                })}
            </div>


            <button
                onClick={onGenerate}
                disabled={isGenerating}
                className={`mt-8 w-full py-[18px] rounded-[12px] font-sans text-[16px] font-medium transition-all duration-200 ${isGenerating
                    ? 'bg-teal/80 text-peach cursor-not-allowed opacity-80 flex flex-row items-center justify-center gap-2'
                    : 'bg-teal text-peach cursor-pointer hover:opacity-90'
                    }`}
            >
                {isGenerating ? (
                    <>
                        <div className="animate-pulse-slow">
                            <SeedIcon size={16} color="#FFD2C2" animated={false} />
                        </div>
                        EmSeed is thinking...
                    </>
                ) : (
                    "Generate Personalised Messages →"
                )}
            </button>
        </div>
    );
}
