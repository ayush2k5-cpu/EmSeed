import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProfileRevealPage() {
    const navigate = useNavigate()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="bg-lemon min-h-screen flex flex-col items-center justify-center text-center px-8 relative overflow-hidden selection:bg-violet selection:text-lemon">

            {/* Organic background shapes */}
            <div className="absolute top-20 right-10 w-80 h-80 bg-ember/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-20 w-96 h-96 bg-teal/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

            {/* Icon */}
            <div
                className={`mb-8 opacity-0 ${mounted ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
            >
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" stroke="#5F4A8B" strokeWidth="2" />
                    <rect x="28" y="28" width="24" height="24" stroke="#5F4A8B" strokeWidth="2" />
                </svg>
            </div>

            <h1
                className={`font-serif text-[56px] md:text-[72px] text-violet leading-[1.1] mb-6 opacity-0 ${mounted ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
            >
                You're a<br />Careful Thinker
            </h1>

            <p
                className={`font-sans text-[20px] font-light text-violet/70 max-w-[480px] mx-auto opacity-0 ${mounted ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
            >
                You value accuracy, process, and being respected for your thoroughness rather than speed.
            </p>

            <div
                className={`w-[80px] h-[1px] bg-ember mx-auto my-10 opacity-0 ${mounted ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: '1100ms', animationFillMode: 'forwards' }}
            />

            <p
                className={`font-sans text-[18px] text-violet max-w-[420px] mx-auto opacity-0 ${mounted ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: '1300ms', animationFillMode: 'forwards' }}
            >
                Your leader will now communicate with you in a way that respects how you process information.
            </p>

            <button
                onClick={() => navigate('/dashboard')}
                className={`mt-12 bg-violet text-peach font-sans text-[18px] font-medium py-4 px-10 rounded-[16px] shadow-xl shadow-violet/10 opacity-0 hover:-translate-y-1 hover:shadow-violet/20 transition-all ${mounted ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: '1600ms', animationFillMode: 'forwards' }}
            >
                Enter Leader Dashboard →
            </button>

        </div>
    )
}
