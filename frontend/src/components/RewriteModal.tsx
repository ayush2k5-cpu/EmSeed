import React from 'react';
import type { RewriteCard as RewriteCardType } from '../types';
import RewriteCard from './RewriteCard';

interface RewriteModalProps {
    rewrites: RewriteCardType[];
    approvedCards: string[];
    onApprove: (memberId: string) => void;
    onSendAll: () => void;
    onClose: () => void;
}

export default function RewriteModal({
    rewrites,
    approvedCards,
    onApprove,
    onSendAll,
    onClose
}: RewriteModalProps) {
    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[4px] animate-fade-up"
                onClick={onClose}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(680px,90vw)] max-h-[80vh] overflow-y-auto bg-peach rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
                <div className="animate-fade-up p-10 h-full flex flex-col">
                    <div className="mb-8">
                        <h2 className="font-serif text-[28px] text-teal mb-2">Personalised for your team</h2>
                        <p className="font-sans text-[14px] text-teal/60">Review each message. Edit freely. You always decide.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {rewrites.map((rewrite, i) => (
                            <RewriteCard
                                key={rewrite.memberId}
                                card={rewrite}
                                isApproved={approvedCards.includes(rewrite.memberId)}
                                onApprove={onApprove}
                                index={i}
                            />
                        ))}
                    </div>

                    <div className="sticky bottom-0 bg-peach border-t border-teal/20 pt-6 mt-6 flex justify-between items-center -mx-10 px-10">
                        <button
                            onClick={onClose}
                            className="text-teal/50 font-sans text-[14px] bg-transparent border-none cursor-pointer"
                        >
                            ✕ Cancel
                        </button>

                        <button
                            onClick={onSendAll}
                            disabled={approvedCards.length === 0}
                            className={`bg-teal text-peach font-sans text-[16px] font-medium px-8 py-4 rounded-[12px] ${approvedCards.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Send All Approved →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
