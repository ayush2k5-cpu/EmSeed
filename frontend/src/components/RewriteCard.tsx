import React, { useState } from 'react';
import type { RewriteCard as RewriteCardType } from '../types';

interface RewriteCardProps {
    card: RewriteCardType;
    isApproved: boolean;
    onApprove: (memberId: string) => void;
    index: number;
}

const discColours: Record<string, string> = {
    D: '#E8A598',
    I: '#F0D4A0',
    S: '#C4B8E0',
    C: '#A8C4C0'
};

export default function RewriteCard({ card, isApproved, onApprove, index }: RewriteCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(card.rewrittenMessage);

    return (
        <div
            className="bg-white/50 border border-teal/30 rounded-[14px] p-6 animate-fade-up opacity-0"
            style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'forwards',
                borderLeft: isApproved ? '3px solid #789A99' : undefined
            }}
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="pt-[6px]">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: discColours[card.discType] || '#A8C4C0' }}
                        />
                    </div>
                    <div>
                        <div className="font-serif text-[18px] text-teal">{card.memberName}</div>
                        <div className="font-sans text-[12px] text-teal/50">
                            DISC-{card.discType} · {card.discLabel} · {card.energyLevel}
                        </div>
                    </div>
                </div>
                {isApproved && <span className="text-teal text-[20px]">✓</span>}
            </div>

            <div className="mt-4 p-4 bg-peach/60 rounded-[8px]">
                {!isEditing ? (
                    <p className="font-sans text-[15px] leading-relaxed text-teal">
                        {editedMessage}
                    </p>
                ) : (
                    <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        autoFocus
                        className="w-full bg-transparent resize-none font-sans text-[15px] leading-relaxed text-teal outline-none"
                        rows={4}
                    />
                )}
            </div>

            <div className="mt-4 flex gap-3">
                <button
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing || isApproved}
                    className="border border-teal/40 text-teal bg-transparent font-sans text-[14px] px-5 py-2.5 rounded-[8px] disabled:opacity-50"
                >
                    Edit
                </button>

                {!isApproved ? (
                    <button
                        onClick={() => onApprove(card.memberId)}
                        className="bg-teal text-peach font-sans text-[14px] px-5 py-2.5 rounded-[8px]"
                    >
                        Approve ✓
                    </button>
                ) : (
                    <button
                        disabled
                        className="bg-teal/50 text-peach font-sans text-[14px] px-5 py-2.5 rounded-[8px] cursor-not-allowed"
                    >
                        Approved ✓
                    </button>
                )}
            </div>
        </div>
    );
}
