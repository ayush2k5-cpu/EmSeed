import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SeedIcon from '../components/SeedIcon'

// Emojis match backend EMOJI_SCORE_MAP: ✅=90, 🔥=85, 🫂=75, 🤔=40, 😶=15
const emojis = ['😶', '🤔', '🫂', '🔥', '✅']

export default function EmojiTapPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null)
    const [showAck, setShowAck] = useState(false)

    // Grab the dynamic name and message passed from the Dashboard sending logic
    const recipientName = location.state?.name || 'Granth'
    const dynamicMessage = location.state?.message ||
        "Your weekend work did not go unnoticed. I see it. This week I need your precision on the API layer specifically — nothing more, nothing beyond that."

    const handleEmojiClick = (index: number) => {
        setSelectedEmoji(index)

        setTimeout(() => {
            setShowAck(true)

            // Auto-redirect to dashboard pulse tab after acknowledgment
            setTimeout(() => {
                navigate('/dashboard?tab=pulse')
            }, 2000)

        }, 600)
    }

    return (
        <div className="bg-lemon min-h-screen flex flex-col items-center justify-center px-6 relative selection:bg-violet selection:text-lemon overflow-hidden">
            {/* Organic background shapes */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-[540px] flex flex-col items-start relative z-10 animate-fade-up">
                <div className="mb-8 w-full flex justify-between items-center">
                    <p className="font-sans text-[14px] uppercase tracking-[0.1em] text-violet/60 font-medium">
                        From: Shivansh
                    </p>
                    <div className="px-3 py-1 rounded-full bg-violet/10 text-violet text-[12px] font-semibold tracking-wide">
                        Just Now
                    </div>
                </div>

                <div className="bg-violet rounded-[24px] p-10 w-full shadow-2xl shadow-void/10 relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-lemon/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

                    <p className="font-sans text-[18px] md:text-[20px] leading-relaxed text-lemon/90 font-light relative z-10 whitespace-pre-wrap">
                        {dynamicMessage}
                    </p>
                </div>

                <p className="font-sans italic text-[16px] text-violet/80 mt-12 mb-6 ml-2">
                    How does this land for you?
                </p>

                <div className="flex justify-center gap-6 mt-4 w-full">
                    {emojis.map((emoji, idx) => {
                        const isSelected = selectedEmoji === idx
                        const hasSelection = selectedEmoji !== null

                        let scaleClass = 'scale-100'
                        let opacityClass = 'opacity-60'

                        if (hasSelection) {
                            if (isSelected) {
                                scaleClass = 'scale-125'
                                opacityClass = 'opacity-100'
                            } else {
                                scaleClass = 'scale-90'
                                opacityClass = 'opacity-30'
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleEmojiClick(idx)}
                                className={`text-[36px] cursor-pointer transition-all duration-200 
                            ${!hasSelection && 'hover:opacity-100 hover:scale-110'} 
                            ${scaleClass} ${opacityClass}`}
                            >
                                {emoji}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Acknowledgement Overlay */}
            <div
                className={`fixed inset-0 bg-lemon flex flex-col items-center justify-center gap-4 transition-opacity duration-500 pointer-events-none z-50 ${showAck ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <SeedIcon size={32} color="#5F4A8B" animated={false} />
                <h2 className="font-serif text-[36px] text-violet">
                    Thanks, {recipientName}.
                </h2>
            </div>
        </div>
    )
}
